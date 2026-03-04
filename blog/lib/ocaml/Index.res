module State = {
  @record
  type t = {
    iterations: int,
    name: string,
  }
  let make = (name, iterations) => {iterations: iterations, name: name}
}

type actionType =
  | Update

module Action = {
  type t = {kind: actionType}
  let ofType = actionType => {kind: actionType}
}

let initialState = State.make("world", 0)

let mutatedState = ref(initialState)
let unref = refState => refState.contents

type stateupdater = (State.t, Action.t) => State.t
let updateState: stateupdater = (previous, action) => {
  switch action.kind {
  | Update =>
    mutatedState.contents = State.make("updates", previous.iterations + 1)
  }
  mutatedState.contents
}

type element
type document
type hyperHTML

@val external document: document = "document"
@val external hyperHTML: hyperHTML = "hyperHTML"

@send
external getElementById: (document, string) => Nullable.t<element> = "getElementById"

type hyperTemplate = string => unit
@send
external bind: (hyperHTML, Nullable.t<element>) => hyperTemplate = "bind"

let refRoot: ref<option<hyperTemplate>> = ref(None)

let onClicked = %raw("(function() { return window.onclickHandler(); })")

let makeTemplate = (state: State.t): string => {
  let name = state.name
  let iterations = Int.toString(state.iterations)
  "<div onclick=" ++ onClicked ++ ">Hello, " ++ name ++ " " ++ iterations ++ "</div>"
}

let render: (State.t, hyperTemplate) => unit = (state, root) => {
  root(makeTemplate(state))
}

type dispatcher = Action.t => unit
let dispatch: dispatcher = action => {
  let root = unref(refRoot)
  let state = updateState(unref(mutatedState), action)
  switch root {
  | Some(root) => render(state, root)
  | None => ()
  }
  ()
}

let main = () => {
  let renderer = hyperHTML->bind(document->getElementById("root"))
  refRoot.contents = Some(renderer)
  ignore(render(initialState, renderer))
}

%raw("window.onload = main")
