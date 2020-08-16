"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zip = void 0;
const adm_zip_1 = __importDefault(require("adm-zip"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
function exitsFile(filepath) {
    return fs_1.default.existsSync(filepath);
}
function makeZip(filepath) {
    if (!filepath || !filepath.endsWith(".html")) {
        return;
    }
    let htmlfile = filepath, cssfile = filepath.replace(".html", ".css"), jsonfile = filepath.replace(".html", ".json");
    if (!exitsFile(htmlfile)) {
        console.log(chalk_1.default.red(`${htmlfile} not exits.Ignore zip.`));
        return;
    }
    if (!exitsFile(jsonfile)) {
        console.log(chalk_1.default.red(`${jsonfile} not exits.Ignore zip.`));
        return;
    }
    let zip = new adm_zip_1.default();
    zip.addLocalFile(htmlfile);
    zip.addLocalFile(jsonfile);
    if (exitsFile(cssfile)) {
        zip.addLocalFile(cssfile);
    }
    let zipfile = filepath.replace(".html", ".zip");
    zip.writeZip(zipfile, (err) => {
        if (err) {
            console.log(chalk_1.default.red(`${zipfile} zip error ${err}`));
        }
    });
}
exports.zip = (fileOrDir) => {
    if (fs_1.default.lstatSync(fileOrDir).isFile()) {
        //file
        makeZip(fileOrDir);
    }
    else {
        var paths = fs_1.default.readdirSync(fileOrDir).filter((value, i) => {
            return value.endsWith(".html");
        });
        paths.forEach((f) => {
            let file = path_1.default.join(fileOrDir, f);
            makeZip(file);
        });
    }
};
//# sourceMappingURL=zip.js.map