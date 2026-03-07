let dash = Parser.pChar("-")
let newLine = Parser.pChar("\n")
let crlf = Parser.pChar("\r")->Parser.then(newLine)
let enter = newLine->Parser.or(crlf)
let threeDashes = dash->Parser.then(dash->Parser.then(dash->Parser.then(enter)))

let separate = input => {
  let matter = Parser.whileNot(threeDashes)
  let extractor = threeDashes->Parser.skipAnd(matter)
  extractor(input)
}
