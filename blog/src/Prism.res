let prism = %raw("require('prismjs')")

%raw("require('prismjs/components/')()")

let removeLanguagePrefix: string => string = str => {
  let re = %raw("/^language-/")
  let f = %raw("(s, r) => s.replace(r, '')")
  f(str, re)
}

let highlight: (string, string) => string = (code, language) => {
  let lang = removeLanguagePrefix(language)
  let f = %raw("(c, l, p) => { const lang = p.languages[l] || p.languages.javascript; return p.highlight(c, lang, l); }")
  f(code, lang, prism)
}
