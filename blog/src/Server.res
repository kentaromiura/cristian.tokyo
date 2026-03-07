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

  let frontMatter = frontMatterData => {
    let lines = String.split(frontMatterData, "\n")
    Array.reduce(lines, Map.make(), (result, line) => {
      let match = String.match(line->String.trim, /^([^:]+):\s*(.*)$/)
      switch match {
      | Some(m) => {
          let left = m[1]->Option.getUnsafe
          let right = m[2]->Option.getUnsafe
          let _ = Map.set(
            result,
            String.trim(left->Option.getOr("")),
            String.trim(right->Option.getOr("")),
          )
          result
        }
      | None => result
      }
    })
  }

  let fromFrontmatter = (frontmatter: string, content: string): t => {
    let obj = frontMatter(frontmatter)
    {
      content,
      author: obj->Map.get("author")->Option.getOr(""),
      bsky: obj->Map.get("bsky")->Option.getOr(""),
      date: obj->Map.get("date")->Option.getOr(""),
      last_edit: obj->Map.get("last_edit")->Option.getOr(""),
      title: obj->Map.get("title")->Option.getOr(""),
      description: obj->Map.get("description")->Option.getOr(""),
    }
  }

  let notfound = () => {
    content: "Not found",
    author: "",
    bsky: "",
    date: "",
    last_edit: "",
    title: "not found",
    description: "not found",
  }
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

let blogFolder = "blog/blog"

let blogPostFromText: string => string = text => {
  let marked = Markdown.markdown(text)
  let domlist = HtmlParser.parseDOM(marked)
  if Array.length(domlist) != 0 {
    let codelist = HtmlParser.getElementsByTagName("code", domlist)

    Js.Array.forEach(code => {
      let codeText = HtmlParser.getText(code)
      let language = HtmlParser.hasAttrib(code, "class")
        ? HtmlParser.getAttributeValue(code, "class")
        : "language-javascript"
      let isMultiline: bool = codeText->String.includes("\n")
      if isMultiline {
        let highlighted = Prism.highlight(deHTML(codeText), language)
        let replacementHtml =
          "<code class='multiline " ++ language ++ "'>" ++ highlighted ++ "</code>"
        let replacement = switch HtmlParser.parseDOM(replacementHtml)[0] {
        | Some(r) => r
        | None => code
        }
        HtmlParser.replaceElement(code, replacement)
      }
    }, codelist)
    HtmlParser.getOuterHTML(domlist)
  } else {
    marked
  }
}

let getSlug: string => string = file => {
  let re = RegExp.fromString("_(.+).md")
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

type blogCacheData = {
  data: array<(string, Post.t)>,
  version: int,
}

type state = {
  data: array<(string, Post.t)>,
  version: int,
  refreshPromise: option<promise<unit>>,
}

let stateRef = ref({data: [], version: 0, refreshPromise: None})

let getBlogEntries = () => {
  let allFiles = IO.readDir(blogFolder)
  let mdFiles = Belt.List.keep(allFiles, file => endsWith(file, ".md"))
  let blogposts = Belt.List.map(mdFiles, entry => {
    let slug = getSlug(entry)
    let filePath = IO.Path.join(blogFolder, entry)
    let file = IO.readFile(filePath)
    switch file {
    | None => None
    | Some(content) =>
      let result = KindOfMatter.separate(content)
      
      switch result {
      | Error(_) => None
      | Ok(matterText, content) =>
        Some((slug, Post.fromFrontmatter(matterText, blogPostFromText(content))))
      }
    }
  })
  let filtered = Belt.List.keepMap(blogposts, opt => opt)
  let res = Belt.List.toArray(filtered)
  res->Array.sort((x,y) => {
    let (_, p1) = x
    let (_, p2) = y
    Date.compare(Date.fromString(p2.date), Date.fromString(p1.date))
  })
  res

}

let refreshCache = () => {
  stateRef := {data: getBlogEntries(), version: stateRef.contents.version + 1, refreshPromise: None}
}

let scheduleRefresh = () => {
  switch stateRef.contents.refreshPromise {
  | Some(_) => ()
  | None => {
      let promise = %raw(`new Promise(resolve => {
    setTimeout(resolve, 500)
  })`)
      stateRef := {
          data: stateRef.contents.data,
          version: stateRef.contents.version,
          refreshPromise: Some(promise),
        }
      Promise.then(promise, _ => {
        refreshCache()
        Promise.resolve()
      })->ignore
    }
  }
}

let _init = {
  stateRef := {
      data: getBlogEntries(),
      version: 1,
      refreshPromise: None,
    }
  IO.Fs.watch(blogFolder, (_eventType, filename) => {
    switch filename {
    | None => ()
    | Some(_) => scheduleRefresh()
    }
  })
}

let getCachedBlogEntries = () => {
  stateRef.contents.data
}

let waitForRefresh = () => {
  switch stateRef.contents.refreshPromise {
  | Some(p) => p
  | None => %raw(`Promise.resolve()`)
  }
}

let renderBlogPost: string => Post.t = filename => {
  // Return from cached data.
  let cached = getCachedBlogEntries()
  switch cached->Array.find(x => {
    let (s, _) = x
    s == filename
  }) {
    | None => Post.notfound()
    | Some((_, blog)) => blog
  }
}
