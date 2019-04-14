/* I abandoned highlight.js as for some reason it cannot recognize reasonml */
module HighlightValue = {
  [@bs.deriving abstract]
  type t = {value: string};
};

module Highlight = {
  type t;
  [@bs.module "highlight.js"]
  external highlightAuto: (string, array(string)) => HighlightValue.t = "";
};

let removeLanguagePrefix: string => string = [%bs.raw {|(str) => str.replace('language-', '')|}];

let highlight: (string, string) => string =
  (code, language) => {
    HighlightValue.valueGet(Highlight.highlightAuto(code, [|removeLanguagePrefix(
      language
    )|]));
  };