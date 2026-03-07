// tiny parser
type either =
  | Ok(string, string)
  | Error(string)

let isOk = result => {
  switch result {
  | Ok(_, _) => true
  | Error(_) => false
  }
}

let nextChar = input => String.substring(input, ~start=0, ~end=1)
let remaining = input => String.substring(input, ~start=1, ~end=String.length(input))

let pPredicate = predicate =>
  input => {
    let next = nextChar(input)
    predicate(next) ? Ok(next, remaining(input)) : Error("Predicate failed for " ++ next)
  }

let pChar = expected =>
  input => {
    switch pPredicate(c => c == expected)(input) {
    | Ok(result, rest) => Ok(result, rest)
    | Error(_) => Error("Expected " ++ expected ++ " but got " ++ nextChar(input))
    }
  }

let skipAnd = (parser, nextParser) =>
  input => {
    switch parser(input) {
    | Ok(_, rest) => nextParser(rest)
    | Error(err) => Error(err)
    }
  }

let then = (parser, nextParser) =>
  input => {
    switch parser(input) {
    | Ok(resultA, rest) => {
        let res = nextParser(rest)
        switch res {
        | Ok(result, rest) => Ok(resultA ++ result, rest)
        | Error(err) => Error(err)
        }
      }
    | Error(err) => Error(err)
    }
  }

let or = (parser, nextParser) =>
  input => {
    switch parser(input) {
    | Ok(result, rest) => Ok(result, rest)
    | Error(_) => nextParser(input)
    }
  }

let whileNot = parser => {
  input => {
    let rec loop = (input, acc) => {
      switch parser(input) {
      | Error(_) => {
          let n = input->nextChar
          let rest = input->remaining
          if rest == "" {
            Error("")
          } else {
            loop(rest, acc ++ n)
          }
        }
      | Ok(_, rest) => Ok(acc, rest)
      }
    }
    loop(input, "")
  }
}

let many = parser =>
  input => {
    let atLeastOnce = ref(false)
    // tail recursion
    let rec loop = (input, acc) => {
      switch parser(input) {
      | Ok(result, rest) => {
          atLeastOnce := true
          loop(rest, acc ++ result)
        }
      | Error(err) =>
        if !atLeastOnce.contents {
          Error(err)
        } else {
          Ok(acc, input)
        }
      }
    }
    loop(input, "")
  }
