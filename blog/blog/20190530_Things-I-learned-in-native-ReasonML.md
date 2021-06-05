What I learned building a Reason ML Native project
===

I’ve recently written a little tool for optimizing some data;
As I wanted to run as fast as possible and being able to share some logic with the node.js app if needed I’ve decided to use _native Reason_ for this.

I’ve learned a multitude of things in the process and I wanted to share them in case it may help someone.

## I - Booting up a project

I initially follow the 
https://reason-native.com/docs/getting-started guide; if you’re a 
seasoned _ocaml_ engineer you probably know exactly how those lisp-looking configuration files exactly works, and it might be the best choice for you.
If you come from the JS world like me you might find this a bit too overwhelming when anything doesn’t work as 
expected.

In my case I got stuck when I wanted to write my tests;
I had issues on how to properly configure _rely_ to work, and while I eventually got something working it wasn’t ideal.

Instead, for people like me, I highly suggest to just use [Pesy](https://github.com/jordwalke/pesy) instead:

```
npm install -g esy
npm install -g pesy
mkdir my-project
cd my-project
pesy
```

Now you can configure your project from the main _package.json_ in a similar way to a _node.js_ project.

## II - Installing 3rd party packages

Installing packages is as easy as to add them to the 
dependencies/devDependencies properties, in order to install ocaml 
packages you just need to add them with the scoped opam namespace like this:

```json
{
  "@opam/lwt": "*",
  "@opam/cohttp": "*",
  "@opam/cohttp-async": "*",
  "@opam/cohttp-lwt-unix": "*",
  "@opam/tls": "*",
  "@opam/yojson": "*"
}
```

you can also add packages from the reason-native namespace in the same way:

```json
{
  "@reason-native/console": "*",
  "@reason-native/pastel": "*",
  "@reason-native/rely": "^2.1.0"
}
```

In this way you can have the same configuration as the reason-native guide.

After that you'll need to install the modules now with `esy install` and build with `esy build`.
You'll also need to run `esy pesy` in case you change the project configuration; don't worry if this seems too complicated to remember as if you try to `esy build` when in the wrong state you'll be told by the cli what's the best command to run!

## III - Project structure

By default _pesy_ generates 3 projects:

- test
- library
- executable

As I planned to use [Rely](https://reason-native.com/docs/rely/) I needed to organize it slightly differently.

I want to be clear that this results from my personal choices and my limited experience with _Reason_ and therefore it’s not guaranteed to be the best:

In the `buildDirs` section of `package.json` I added a `testcases` 
project like this:

```json
{
  "testcases": {
    "ocamloptFlags": ["-linkall", "-g"],
    "name": "my-project.test-cases.lib",
    "namespace": "TestCases",
    "require": ["my-project.lib", "rely.lib"]
  }
}
```

To work with esy/pesy it needs to start with the 
same name of the project, I named them like `$MY_PROJECT_NAME_HERE.test-cases.lib`.

>**Important!** The `ocamloptFlags` are needed so that _Rely_ can automatically
 find all the test cases, otherwise the compiler will silently remove 
them in the build step as they're not directly used.

As I previously mention you now need to run `esy pesy` so that it will generate the right folder structures for you.

As for project structure, here's some note of how I've organized it:

- the `executable` only requires the main library (`my-project.lib`) and in
 my case it also depends on [minicli](https://github.com/UnixJunkie/minicli) for 
some basic cli option parsing.

- After parsing the options I call `MyProject.Program.main` 
passing the arguments from the cli.


This it’s possible because I created a `Program.re` file in the 
`library` folder, I’ve done this so I can easily run end-to-end tests.

- In the `testcases` folder I've created a `Setup.re` file that looks 
like this:

```reason
/* Setup.re */
include Rely.Make({
  let re = Str.regexp_string("_esy");
  let executedPath = 
    Filename.dirname(Sys.argv[0]);
  let projectPath =
    String.sub(
      executedPath, 
      0, 
      Str.search_forward(
        re, 
        executedPath, 
        0
      )
    );

  let config =
    Rely.TestFrameworkConfig.initialize({
      snapshotDir: 
        projectPath ++ "/__snapshots__",
      projectDir: projectPath,
    });
});
```

The way I configured it will generate the `__snapshot__` folder on the
project root dir; it would be nice to see this kind of configuration (or similar) included in Rely
so that to use the default configuration one could just `include Rely.Defaults()`.

- In the `test` folder the `TestMyProject.re` complete source is this:

```reason
TestCases.Setup.cli();
```

All test files in the `testcases` folder starts with

```reason
open Setup;
open MyProject;
```

The reason for having both a _test_ and a _testcases_ project is because
 I couldn't manage to link the _test_ project to itself and having rely finding any test suites.

My final _buildDirs_ configuration looks like this:

```json
{
  "buildDirs": {
    "testcases": {
      "ocamloptFlags": ["-linkall", "-g"],
      "name": "my-project.test-cases.lib",
      "namespace": "TestCases",
      "require": ["my-project.lib", "rely.lib"]
    },
    "test": {
      "require": [
        "my-project.test-cases.lib",
        "rely.lib"
      ],
      "main": "TestMyProject",
      "name": "TestMyProject.exe"
    },
    "library": {
      "name": "my-project.lib",
      "namespace": "MyProject",
      "require": [
        "console.lib",
        "pastel.lib",
        "lwt",
        "cohttp", 
        "cohttp-async",
        "cohttp-lwt-unix",
        "yojson"
      ]
    },
    "executable": {
      "require": ["my-project.lib"],
      "main": "MyProjectApp",
      "name": "MyProjectApp.exe"
    }
  }
}
```

## IV - How to do http requests and how solve the conduit error

For this I use the `cohttp` module, but when I tried to use it there was
 some errors when try to call any `https` url, to fix this you need to also add the `tls` package.

## V - How to use promises

_Disclaimer: if any functional programming expert is reading this, 
please looks the other way and pretend everything is fine._

In ocaml/reason world promises are done through the [lwt](http://ocsigen.org/lwt/4.1.0/manual/manual) package, _lwt_
 probably stands for _le wonderful top-tier-promise-implementation_

To get the body of an http request we might write a function like this:

```reason
open Lwt;
open Cohttp;
open Cohttp_lwt_unix;

let fetchBody = (url) => {
  let url =
    Uri.of_string(url);
  let headers = ref(Header.init());

  headers := Header.add(
    headers^, 
    "add-some-headers", 
    "here"
  );

  Client.get(~headers=headers^, url)
  >>= (
    ((resp, body)) => 
      Cohttp_lwt.Body.to_string(body)
  );
};
```

if you look closely you'll see the _then_ method hidden by the 
`>>=` operator, for all intents and purpose it works the same way.

You can call and use the promise like this

```reason
fetchBody("http://www.example.com") 
  >>= body => {
  /* nice(body) */
  return ();
}
```

You can return new values from the promise using `return`; 

`Promise.all` is also available but with a different name and it's slightly different: it only accepts a list of promises that return nothing.

The function you might look for is called `Lwt.join` and in 
order to use the results, we'll need something like this:

```reason
let promiseAll = promises => {
  let results = ref([]);
  Lwt.join(
    List.map(
      promise =>
        promise
        >>= (
          result => {
            results := List.cons(
              result,
              results^
            );
            return();
          }
        ),
      promises,
    ),
  )
  >>= (() => 
    return(results^));
};
```

## VI - Code organization

I've found I like to keep all types in a `Types.re` that looks kind of like this:

```reason
module StringSet =
  Set.Make({
    type t = string;
    let compare = compare;
  });
module StringMap =
  Map.Make({
    type t = string;
    let compare = compare;
  });

type foo = StringMap.t(list(string));
type bar = StringMap.t(string);
type baz = StringMap.t(string);
```

this way I can just `open Types;` in the files I need and it also works in the test suites.

In the same way I also have a file for aliases:

```reason
/* Aliases.re */
let forEach = List.iter;
```

And I can `open Aliases;` where needed.

For IO I've _taken inspiration_ from [rely IO](
https://github.com/facebookexperimental/reason-native/blob/master/src/rely/IO.re), plus a single function to return a list of folders:

```reason
let listOfallFilesInFolder = 
  folder => Sys.readdir(folder) 
    |> ArrayLabels.to_list;
```

Apart for this I've a testcase for each file with the same name apart 
for the `Program.re` I mentioned before that I've instead called 
`e2e.re`.

## VII - The Google chain
IDE autocompletion and introspection in VSCode are good with the reasonml extension, but sometime they miss some libraries.

In those cases I need to search on the web.

I've found that searching _<Something> Reasonml native_ returns the most relevant results, followed by _<Something> Reasonml_.

In case I can't find any results I usually search for _<Something> Ocaml_. 

Learning the _Ocaml_ syntax is not required as long as you copy and paste any ocaml example in the [try reason page](https://reasonml.github.io/en/try) as it will automatically convert it for you.

In case you still can't figure it out you can ask for help [to the community](https://reasonml.github.io/docs/en/community).

## Conclusions:

I' m very satisfy of _Reason_ for native development, in particular _Rely_ is blazing fast: 
it runs all of my tests in milliseconds.

Tooling has vastly improved since just a year ago when I tried to do something similar with bsb-native.

IDE supports (in VSCode) is ok-ish, it still misses some library introspections, 
in those case I need to go through the Google chain.

I'd say the experience is _reasonable_. 
But then people will *rightly* unfollow me. 

[Discuss on twitter](https://mobile.twitter.com/search?q=http%3A%2F%2Fcristian.tokyo%2Fblog%2FThings-I-learned-in-native-ReasonML%2F)

