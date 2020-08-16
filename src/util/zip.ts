import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import chalk from "chalk";

function exitsFile(filepath: string) {
  return fs.existsSync(filepath);
}

function makeZip(filepath: string) {
  if (!filepath || !filepath.endsWith(".html")) {
    return;
  }

  let htmlfile = filepath,
    cssfile = filepath.replace(".html", ".css"),
    jsonfile = filepath.replace(".html", ".json");

  if (!exitsFile(htmlfile)) {
    console.log(chalk.red(`${htmlfile} not exits.Ignore zip.`));
    return;
  }
  if (!exitsFile(jsonfile)) {
    console.log(chalk.red(`${jsonfile} not exits.Ignore zip.`));
    return;
  }

  let zip = new AdmZip();
  zip.addLocalFile(htmlfile);
  zip.addLocalFile(jsonfile);

  if (exitsFile(cssfile)) {
    zip.addLocalFile(cssfile);
  }

  let zipfile = filepath.replace(".html", ".zip");
  zip.writeZip(zipfile, (err) => {
    if (err) {
      console.log(chalk.red(`${zipfile} zip error ${err}`));
    }
  });
}

export const zip = (fileOrDir: string) => {
  if (fs.lstatSync(fileOrDir).isFile()) {
    //file
    makeZip(fileOrDir);
  } else {
    var paths = fs.readdirSync(fileOrDir).filter((value, i) => {
      return value.endsWith(".html");
    });
    paths.forEach((f) => {
      let file = path.join(fileOrDir, f);
      makeZip(file);
    });
  }
};
