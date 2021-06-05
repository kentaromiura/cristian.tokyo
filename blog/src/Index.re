module State = {
  [@bs.deriving abstract]
  type t = {
    iterations: int,
    name: string,
  };
  let make = (name, iterations) => t(~iterations, ~name);
};

type actionType =
  | Update; /* | Action2 ... */

module Action = {
  type t = {kind: actionType};
  let ofType = actionType => {kind: actionType};
};

let initialState = State.make("world", 0);

let mutatedState = ref(initialState);
let unref = refState => refState^;

type stateupdater = (State.t, Action.t) => State.t;
let updateState: stateupdater =
  (previous, action) => {
    switch (action.kind) {
    | Update =>
      mutatedState :=
        State.make("updates", State.iterationsGet(previous) + 1)
    };
    mutatedState^;
  };

/* JS World glue */
type element;
type document;
type hyperHTML;

[@bs.val] external document: document = "document";
[@bs.val] external hyperHTML: hyperHTML = "hyperHTML";

[@send]
external getElementById: (document, string) => Js.nullable(element) =
  "getElementById";

type hyperTemplate = string => unit;
[@send]
external bind: (hyperHTML, Js.nullable(element)) => hyperTemplate = "bind";

let refRoot: ref(option(hyperTemplate)) = ref(None);
let render: (State.t, hyperTemplate) => unit = [%bs.raw
  {|
  (state, root) => root`<div onclick=${onClicked}>
    Hello, ${state.name} ${state.iterations}
  </div>`
|}
];

type dispatcher = Action.t => unit;
let dispatch: dispatcher =
  action => {
    let root = unref(refRoot);
    let state = updateState(unref(mutatedState), action);
    switch (root) {
    | Some(root) => render(state, root)
    | None => ()
    };
    ();
  };

let onClicked = () => dispatch(Action.ofType(Update));

let main = () => {
  let renderer = hyperHTML->bind(document->getElementById("root"));
  refRoot := Some(renderer);
  ignore(render(initialState, renderer));
};

/* entry point */
%bs.raw
"window.onload=main";
