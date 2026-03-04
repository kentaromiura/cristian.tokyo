module Post = {
  @record
  type t = {
    content: string,
    author: string,
    bsky: string,
    date: string,
    last_edit: string,
    title: string,
    description: string,
  }

  let fromJson = (_json: string): t => {
    let obj = %raw("(function(j) { return JSON.parse(j); })(_json)")
    {
      content: "",
      author: obj.author,
      bsky: obj.bsky,
      date: obj.date,
      last_edit: obj.last_edit,
      title: obj.title,
      description: obj.description,
    }
  }

  let notfound = () => {content: "Not found", author: "", bsky: "", date: "", last_edit: "", title: "not found", description: "not found"}
}

let deHTML: string => string = %raw(`(codeText) => codeText.replace(/&(.+?);/g, (m, c) => {
  switch(c) {
    case "gt": return ">";
    case "lt": return "<";
    case "quot": return '"';
    case "apos": return "'";
    case "amp": return "&";
    default: return "&" + c + ";";
  }
})`)

let endsWith: (string, string) => bool = (text, search) => Js.String.endsWith(search, text)

let blogPostcontent: string => string = filename => {
  let allFiles = IO.readDir("blog/blog")
  let article = Belt.List.keep(allFiles, file => endsWith(file, "_" ++ filename ++ ".md"))
  if Belt.List.length(article) == 0 {
    "Not found yo!"
  } else {
    let firstArticle = Belt.List.headExn(article)
    let filePath = IO.Path.join("blog/blog", firstArticle)
    let file = IO.readFile(filePath)
    switch file {
    | None => ""
    | Some(text) =>
      let marked = Markdown.markdown(text)
      let domlist = HtmlParser.parseDOM(marked)
      if Array.length(domlist) != 0 {
        let codelist = HtmlParser.getElementsByTagName("code", domlist)

        Js.Array.forEach(
          code => {
            let codeText = HtmlParser.getText(code)
            let language = HtmlParser.hasAttrib(code, "class")
              ? HtmlParser.getAttributeValue(code, "class")
              : "language-javascript"
            let isMultiline: bool = %raw("codeText.includes('\\n')")
            if isMultiline {
              let highlighted = Prism.highlight(deHTML(codeText), language)
              let replacementHtml = "<code class='multiline " ++ language ++ "'>" ++ highlighted ++ "</code>"
              let replacement = switch HtmlParser.parseDOM(replacementHtml)[0] {
              | Some(r) => r
              | None => code
              }
              HtmlParser.replaceElement(code, replacement)
            }
          },
          codelist,
        )
        HtmlParser.getOuterHTML(domlist)
      } else {
        marked
      }
    }
  }
}

let getSlug: string => string = file => {
  let re = RegExp.fromString("_(.+).json")
  let result = RegExp.exec(re, file)
  switch result {
  | None => ""
  | Some(match) =>
    let captures = RegExp.Result.matches(match)
    let maybeCapture = Belt.Array.get(captures, 0)
    switch maybeCapture {
    | None => ""
    | Some(capture) =>
      switch capture {
      | None => ""
      | Some(c) => c
      }
    }
  }
}

let blogEntries = {
  let allFiles = IO.readDir("blog/blog")
  let jsons = Belt.List.keep(allFiles, file => endsWith(file, ".json"))
  let blogposts = Belt.List.map(jsons, entry => {
    let slug = getSlug(entry)
    let filePath = IO.Path.join("blog/blog", entry)
    let file = IO.readFile(filePath)
    switch file {
    | None => None
    | Some(json) =>
      Some((slug, Post.fromJson(json)))
    }
  })
  let filtered = Belt.List.keep(blogposts, opt =>
    switch opt {
    | None => false
    | Some(_) => true
    }
  )
  Belt.List.toArray(filtered)
}

let renderBlogPost: string => Post.t = filename => {
  let allFiles = IO.readDir("blog/blog")
  let meta = Belt.List.keep(allFiles, file => endsWith(file, "_" ++ filename ++ ".json"))
  if Belt.List.length(meta) == 0 {
    Post.notfound()
  } else {
    let firstMeta = Belt.List.headExn(meta)
    let filePath = IO.Path.join("blog/blog", firstMeta)
    let file = IO.readFile(filePath)
    switch file {
    | None => Post.notfound()
    | Some(json) =>
      let content = blogPostcontent(filename)
      let post = Post.fromJson(json)
      {...post, content: content}
    }
  }
}
