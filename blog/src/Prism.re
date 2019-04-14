/* Load ALL THE LANGUAGES! */

let prism = [%bs.raw {|require("prismjs")|}];
[%bs.raw {|require("prismjs/components/")()|}];

let removeLanguagePrefix: string => string =
  str => Js.String.replace("language-", "", str);

let highlight: (string, string) => string =
  (code, language) => {
    let doHighlight: (string, string) => string = [%bs.raw
      {|
        (code, language) => prism.highlight(code, prism.languages[language], language)
    |}
    ];
    doHighlight(code, language |> removeLanguagePrefix);
  };
