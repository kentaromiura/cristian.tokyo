type t;
/* Originally using snudown to be reddit-compatible,
   eventually moved to markdown-it as it supports more stuff */
let md = [%raw
  "require('markdown-it')({
    html:false
}).use(
    require('markdown-it-footnote')
)"
];

let markdown: string => string = [%raw "(input) => md.render(input)"];
