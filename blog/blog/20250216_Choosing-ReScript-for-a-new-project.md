Why choosing _ReScript_ for a new project in 2025
===

When I suggested using _ReScript_ for a new project, rather than the current _TypeScript_/_React_ stack,
I was asked to write my reasoning for why I think _ReScript_ would be a better fit for us,
I thought it would be a good idea to write the reasons here (no pun intended).

# Reasons:

- It’s easy to migrate _to_ and _from_:

  _ReScript_ compiles down to readable _JavaScript_, and it has an option to export its type to the Typescript world using [genType](https://rescript-lang.org/docs/manual/v11.0.0/typescript-integration), and this feature it’s very easy and convenient to integrate to a normal TypeScript codebase this way.

- Compared to other functional language it generates tiny output, as an example a [simple Hello world](https://github.com/bryanjenningz/25-elm-examples/blob/master/01-hello-world.elm) in _elm_ produces a 92K index.html file, of which the HTML is not the problem.

  In comparison [_ReScript_ produces just `console.log(“Hello, world”);`](https://rescript-lang.org/try?version=v11.1.4&module=commonjs&code=MIewdgziA2CmB00QHMAUAiAEraSA0ABAO4gBO0AJugJRA) (plus a bunch of comments).

  In general, _ReScript_ produces quite readable _JavaScript_.

- It’s also [quite fast compared to the other languages](https://unsafeperform.io/blog/2022-07-02-a_small_benchmark_for_functional_languages_targeting_web_browsers/), notice the difference with PureScript (a Haskell dialect) in both code generation and speed.

- It comes with batteries attached, with the very good [Belt](https://rescript-lang.org/docs/manual/v11.0.0/api/belt) and a [core library](https://rescript-lang.org/docs/manual/v11.0.0/api/core) that in the next major version will be part of the language.

- It has zero cost abstractions in the form of types: all types are stripped out of the final output but used during development to allow us to make the code safer.

- It’s still [potentially possible to share code with Native OCaml](https://github.com/kentaromiura/utopia/tree/test-latest-rescript), allowing executing tests with [_Rely_](https://www.npmjs.com/package/@reason-native/rely), a [_Jest_](https://jestjs.io/) inspired native test runner which is extremely fast compared to any JS test runners.

- Talking about _OCaml_, as I previously said somewhere else _Reason_ **is** _OCaml_.
_ReScript_ was _Reason_, so it retains the robust [Hindley-Milner type inference](https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system) that powers languages such OCaml and Haskell, but what does this means to us is that you’d rarely need to type your parameters or return types and your code will still be strongly typed.

- _ReScript_ comes with _JSX_ as a part of the language, and [works well](https://github.com/kentaromiura/rescript-react-esbuild/blob/main/src/Main.res) with _React_

- The syntax is [similar to _JavaScript_](https://rescript-lang.org/docs/manual/v11.0.0/overview) with some _OCaml_ influences, but nothing too difficult to learn.

- The language is immutable by default, no need to use immutable libraries (although I don’t dislike [immer](https://immerjs.github.io/immer/)) in my _JavaScript_.

- Compilation time is fast, [it’s build with performance in mind](https://rescript-lang.org/docs/manual/v11.0.0/build-performance), and seems consistent in large codebase where [a cold build could take around 10s for 40k lines](https://forum.rescript-lang.org/t/people-with-large-codebases-what-are-the-compile-times-like/4176), and *almost instant* in watch mode.

- It’s [very easy](https://rescript-lang.org/docs/manual/v11.0.0/external) to integrate existing JS/TS libraries.

In summary, I think _ReScript_ stays out of the way of the developer while still doing its job of being a safeguard thanks to its strong type system, its superpower is type inference, which means no more `has implicit type any` messages in loops, forcing you to type a function parameter used in a single place.

Cons to adopt _ReScript_ are that the language is being developed by a small team and there’s not much adoption yet, plus a need to learn a new language, and the cost to update to future versions is unknown.

I think those are a reasonable challenge for some team, but I think in my case it’s not a big of a deal;

as I mentioned previously, _ReScript_ is easy to migrate **from**, so worst-case scenario we’ll have an exit route.

# Final words

I used to be quite contrary to use a different language that compiles to _JavaScript_ for a reason or another in the past, but we live in a world where compilation steps are mandatory and as crazy as it sounds it can take many minutes to build a client application.

I come from a time where building an egregious UI application would take seconds as we would [just append different files together and pipe them to a linter/minifier](https://mykenta.blogspot.com/2011/02/post-mortem-of-big-js-project-part-i.html), now it’s super easy to produce huge bundle where 90% of the code is not even running.

Oppose this to something like _ReScript_ that produce small code by default, cuts out what’s unused and makes tree-shakable libraries and then it’s easy to see [results like this](https://github.com/kentaromiura/rescript-react-esbuild/blob/actix/assets/lighthouse.png).

I’m not as opposed to different languages as I used to be, after all we extended _JavaScript_ to support types and to add a lot more features to the language, with the availability of a [vast user library](https://www.npmjs.com/) now we now need those tools.

But first and foremost is the User Experience,  I think _ReScript_ improves the developer experience without negatively affecting users.

[Discuss on bluesky](https://bsky.app/search?q=https%3A%2F%2Fcristian.tokyo%2Fblog%2FChoosing-ReScript-for-a-new-project)
