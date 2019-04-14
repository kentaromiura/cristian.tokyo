module Fs = {
  type stats;

  [@bs.module "fs"] external readdirSync: string => array(string) = "";
  [@bs.module "fs"] external existsSync: string => bool = "";
  [@bs.module "fs"] external statSync: string => stats = "";
  [@bs.module "fs"] external readFileSync: (string, string) => string = "";

  [@bs.send.pipe: stats] external isFile: bool = "isFile";
};

module Path = {
  [@bs.module "path"] external join: (string, string) => string = "";
};

let readFile: string => option(string) =
  filename => {
    let exists = Fs.existsSync(filename);
    switch (exists) {
    | false => None
    | true =>
      let isFile = Fs.statSync(filename) |> Fs.isFile;
      isFile ? Some(Fs.readFileSync(filename, "utf8")) : None;
    };
  };

let readDir: string => list(string) =
  dir => {
    switch (Fs.existsSync(dir)) {
    | false => []
    | true =>
      let isFile = Fs.statSync(dir) |> Fs.isFile;
      isFile ? [] : ArrayLabels.to_list(Fs.readdirSync(dir));
    };
  };