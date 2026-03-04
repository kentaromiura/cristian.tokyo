module Fs = {
  type stats

  @module("fs")
  external readdirSync: string => array<string> = "readdirSync"

  @module("fs")
  external existsSync: string => bool = "existsSync"

  @module("fs")
  external statSync: string => stats = "statSync"

  @module("fs")
  external readFileSync: (string, string) => string = "readFileSync"

  @send
  external isFile: stats => bool = "isFile"
}

module Path = {
  @module("path")
  external join: (string, string) => string = "join"
}

let readFile: string => option<string> = filename => {
  let exists = Fs.existsSync(filename)
  if !exists {
    None
  } else {
    let isFile = Fs.statSync(filename)->Fs.isFile
    if isFile {
      Some(Fs.readFileSync(filename, "utf8"))
    } else {
      None
    }
  }
}

let readDir: string => list<string> = dir => {
  if !Fs.existsSync(dir) {
    list{}
  } else {
    let isFile = Fs.statSync(dir)->Fs.isFile
    if isFile {
      list{}
    } else {
      Belt.List.fromArray(Fs.readdirSync(dir))
    }
  }
}
