Writing purely ReasonML
========================

I’ve recently stumbled upon a series of videos where [Tsoding](https://twitter.com/@tsoding) solves some brain teaser from [Hacker Rank](https://www.hackerrank.com/)
> but, you know, in _Haskell_ 

In the [first episode](https://www.youtube.com/watch?v=h_D4P-KRNKs)
the problem was to get some integers as an input from the stdio and to sum them together.

This one line[^1] is the proposed solution:

```haskell
main 
  = interact 
  $ show 
  . sum 
  . map read 
  . tail 
  . words
```
[^1]: here I use indentation for people reading on a smartphone.

We know that _OCaml_ is usually compared to _Haskell_, and that _Reason_ is *basically just _OCaml_(TM)*.

Surely it would be easy to use imperative code to solve this problem, but can we reach something as close as possible to the solution above?

One thing that makes the expression above very readable is the chain of function compositions, unfortunately Reason doesn’t provide a `.` operator, but luckily is super easy to define our own operators.

Unfortunately, we cannot use `.` as it’s a reserved token, but we can though take inspiration from F#:

[F# defines this two operators](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/symbol-and-operator-reference/):
> `>>` Composes two functions (forward composition operator)

> `<<` Composes two functions but in reverse order: it executes the second one first (backward composition operator).

Let’s define the same operators in _ReasonML_:

First let’s define a _compose_ function:

```reason
let compose 
  = (f, g, x) => g(f(x));
```
Let’s also define a _backwardsCompose_ function that execute the second function first:
```reason
let backwardCompose 
  = (f, g, x) => f(g(x));
```
Now it’s possible to associate the two operators to these functions:

```reason
let (>>) = compose;
let (<<) = backwardCompose;
```

After this, let’s substitute _Haskell_ `.` for `<<` and drop the `main =` part as Reason doesn’t need it:
```reason
interact 
  $ show 
  << sum 
  << map read 
  << tail 
  << words
```

We’re unfortunately not done yet as those functions don’t exist in Reason, so we must define them ourself.

Let’s temporarily ignore `interact` for a moment and try to define the remaining functions:

- `show` in _Haskell_ converts from a number to a string, given that this problem is the sum of integers, we will use the standard `string_of_int`:

```reason
let show = string_of_int;
```
- `sum` takes a list of numbers and return the sum; think of this as a `fold` that apply the `+` operator starting with `0` as the initial value:
```reason
let sum = List.fold_left((+), 0);
```

- `map` and `tail` are the _Haskell_ equivalents of respectively `List.map` and the `List.tl` functions:
```reason
let map = List.map;
let tail = List.tl;
```
- `read` is the reverse of `show`: it takes a string and converts it to a number, so what we need here is `int_of_string`:
```reason
let read = int_of_string;
```
- finally `words` split a string by white spaces, we can apply the `Str.split` and `Str.regexp` functions:
```reason
let words 
  = Str.split 
  @@ Str.regexp("[ \t\n]+");
```
> Notice how here I’ve used the `@@` application operator:
>
> `a @@ b` is equivalent to `a(b)`.
>
> This is the equivalent to `$` in _Haskell_, so we can either change the `$` to `@@` in the original expression or, since it’s not defined yet, *try* to alias `$` to `@@`:
```
let ($) = @@;
```

We’re only left with `interact`.

`interact` puts all the standard input in a string; it then executes a function with it redirecting the output to the standard output.

I couldn’t find anything similar in _ReasonML_, so I hacked together the interact function using `read_line` instead:
```reason
let interact 
  = f => {
    let acc = ref([]);
    try (
      while (true) {
        acc := List.concat(
          [
            acc^, 
            [read_line()]
          ]
        );
      }
    ) {
    | End_of_file => 
      String.concat("\n", acc^) 
      |> f 
      |> print_string
    };
  };
```
Ugh... this uses mutations and imperative code and handling with I/O.

Last thing remaining yet to do is to change the application of `map read` as I’ve describe above in Reason function application is not the _space character_:

```reason
interact 
  $ show 
  << sum 
  << map(read) 
  << tail 
  << words
```
Rewriting this by reversing the functional composition gives us a more top-down flow:
```reason
interact 
  $ words 
  >> tail 
  >> map(read) 
  >> sum 
  >> show;
```

if we try to compile this, we’ll see that it doesn’t quite work as expected due of how _Reason_ infer the associativity of `$` and `>>`, and it‘s solved by adding parenthesis:
```reason
interact 
  $ (
    words 
    >> tail 
    >> map(read) 
    >> sum 
    >> show
  );
```
The main reason `$` exists in Haskell is because of associativity though.

Another way to avoid using parentheses we have in _Reason_ is to use the _reverse application_ operator `|>` and moving `interact` to the end:
```reason
words 
  >> tail 
  >> map(read) 
  >> sum 
  >> show 
  |> interact
``` 

Conclusions
===========
Apart for the `interact` function we reproduced a solution very similar to the _Haskell_ one, while keeping the same level of purity using mostly a functional approach.
