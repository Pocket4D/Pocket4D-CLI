import chalk from "chalk";
import fs from "fs";
import path from "path";

import { PDParser } from "../parser/parser";
import { Watcher } from "../util/watch";

// TODO: this doesn't do anything, but should zip/package the final build artifact.
const pwpackage = (..._: any[]) => {
  return Promise.resolve();
};

export const start = async (argv: any) => {
  if (argv.e && argv.e === "dev") {
    try {
      let dir = argv.d || argv.f;
      if (fs.statSync(dir).isFile()) {
        dir = path.dirname(dir);
      }
      let w = new Watcher(dir);
      w.start();
    } catch (error) {
      return Promise.reject(error);
    }
  }
  if (argv.d) {
    //编译目录
    let { d, e } = argv;
    if (argv.e && argv.e != "dev") {
      await pwpackage(d, "build");
    }

    let dir = d;
    if (dir) {
      var paths = fs.readdirSync(dir).filter((value, i) => {
        return value.endsWith(".html");
      });
      paths.forEach((v, i) => {
        let fullpath = path.join(dir, v);
        new PDParser(fullpath).parse();
      });
    }
    return Promise.resolve();
  } else if (argv.f) {
    //编译单个文件
    let { f, e } = argv;
    let dir = path.dirname(f);
    if (argv.env && argv.env != "dev") {
      await pwpackage(dir, "build");
    }
    return await new PDParser(f).parse();
  } else {
    console.log(chalk.red("请用--f指定模板文件或用--d指定模板目录\n"));
    return Promise.resolve();
  }
};
