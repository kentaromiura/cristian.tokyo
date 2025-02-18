module Post = {
  [@bs.deriving abstract]
  type t = {
    content: string,
    author: string,
    bsky: string,
    date: string,
    last_edit: string,
    title: string,
    description: string,
  };

  let rec make =
          (content, author, bsky, date, last_edit, title, description) =>
    t(~content, ~author, ~bsky, ~date, ~last_edit, ~title, ~description)
  and notfound = () =>
    make("Not found", "", "", "", "", "not found", "not found");
};

let deHTMLRegExp = Js.Re.fromStringWithFlags("&(.+?);", ~flags="g");
let deHTML: string => string =
  codeText => {
    let deHTML = (_, capture, _, _) =>
      switch (capture) {
      | "gt" => ">"
      | "lt" => "<"
      | "quot" => "\""
      | "apos" => "'"
      | "amp" => "&"
      | _ => "&" ++ capture ++ ";"
      };
    Js.String.unsafeReplaceBy1(deHTMLRegExp, deHTML, codeText);
  };

let endsWith: (string, string) => bool =
  (text, search) => Js.String.endsWith(search, text);

/* utility to avoid boilerplate */
let unsafeFillMeta: ('a, string) => Post.t = [%bs.raw
  {|
  (f, json) => {
    const obj = JSON.parse(json);
    return f(
      obj.author,
      obj.bsky,
      obj.date,
      obj.last_edit,
      obj.title,
      obj.description
    );
  }
|}
];

let blogPostcontent: string => string =
  filename => {
    let article =
      IO.readDir("blog/blog")
      |> List.filter(file => endsWith(file, "_" ++ filename ++ ".md"));
    if (List.length(article) == 0) {
      "Not found yo!";
      /* TODO: Better 404 handling */
    } else {
      let file = IO.Path.join("blog/blog", List.hd(article)) |> IO.readFile;
      switch (file) {
      | None => ""
      | Some(text) =>
        let marked = Markdown.markdown(text);
        let domlist = Dom.parseDOM(marked);
        if (Js.Array.length(domlist) != 0) {
          let codelist = Dom.DomUtils.getElementsByTagName("code", domlist);

          Js.Array.forEach(
            code => {
              let codeText = Dom.DomUtils.getText(code);
              let language =
                Dom.DomUtils.hasAttrib(code, "class")
                  ? Dom.DomUtils.getAttributeValue(code, "class")
                  : "language-javascript";
              let isMultiline: bool = [%bs.raw {|codeText.includes('\n')|}];
              if (isMultiline) {
                let highlighted =
                  Prism.highlight(codeText |> deHTML, language);

                Dom.DomUtils.replaceElement(
                  code,
                  Dom.parseDOM(
                    "<code class='multiline "
                    ++ language
                    ++ "'>"
                    ++ highlighted
                    ++ "</code>",
                  )[0],
                );
              };
            },
            codelist,
          );
          Dom.DomUtils.getOuterHTML(domlist);
        } else {
          marked;
        };
      };
    };
  };

let getSlug: string => string =
  file => {
    Js.Re.exec_(Js.Re.fromString("(.+)?_(.+).json"), file)
    |> (
      result => {
        switch (result) {
        | None => ""
        | Some(match) =>
          let maybeCapture = Js.Re.captures(match)[2] |> Js.Nullable.toOption;
          switch (maybeCapture) {
          | None => ""
          | Some(capture) => capture
          };
        };
      }
    );
  };

let blogEntries = {
  let jsons =
    IO.readDir("blog/blog") |> List.filter(file => endsWith(file, ".json"));
  let blogposts =
    List.map(
      entry => {
        let slug = getSlug(entry);
        let file = IO.Path.join("blog/blog", entry) |> IO.readFile;
        switch (file) {
        | None => None
        | Some(json) =>
          let f = Post.make("");
          Some((slug, unsafeFillMeta(f, json)));
        };
      },
      jsons,
    );
  List.filter(
    option =>
      switch (option) {
      | None => false
      | Some(_) => true
      },
    blogposts,
  )
  |> ArrayLabels.of_list;
};

let renderBlogPost: string => Post.t =
  filename => {
    let meta =
      IO.readDir("blog/blog")
      |> List.filter(file => endsWith(file, "_" ++ filename ++ ".json"));
    if (List.length(meta) == 0) {
      Post.notfound();
    } else {
      let file = IO.Path.join("blog/blog", List.hd(meta)) |> IO.readFile;
      switch (file) {
      | None => Post.notfound()
      | Some(json) =>
        let f = Post.make(blogPostcontent(filename));
        unsafeFillMeta(f, json);
      };
    };
  };
