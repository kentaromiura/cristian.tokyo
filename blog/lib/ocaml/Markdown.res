type t

let md = %raw("(require('markdown-it')({html:false}).use(require('markdown-it-footnote')))")

let markdown: string => string = %raw("(input) => md.render(input)")
