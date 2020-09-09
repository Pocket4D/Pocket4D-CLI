"use strict";
/**
 * 创建模板
 */
// let path = require("path");
// let fs = require("fs");
// let logger = require("../util/logger");
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger = __importStar(require("../util/logger"));
exports.createTemplate = (tplcode, tplname) => {
    let projectDir = path_1.default.resolve("."), clidir = __dirname, tplDir = path_1.default.resolve(clidir, "tpl");
    logger.log(`cli dir:${clidir}\n  template create dir:${projectDir}`);
    let srcDir = path_1.default.resolve(projectDir, "src");
    if (!fs_1.default.existsSync(srcDir)) {
        fs_1.default.mkdirSync(srcDir);
    }
    let files = fs_1.default.readdirSync(tplDir).filter((x) => x.endsWith(".tpl"));
    files.forEach((x) => {
        let name = x.replace(".tpl", ""), ext = path_1.default.extname(name);
        name = `${tplcode}${ext}`;
        let src = path_1.default.resolve(tplDir, x);
        let dest = path_1.default.resolve(projectDir, "src", name);
        let txt = fs_1.default.readFileSync(src).toString();
        //replace code、name
        txt = txt.replace("${code}", tplcode);
        txt = txt.replace("${name}", tplname);
        //write file
        fs_1.default.writeFileSync(dest, txt);
    });
    logger.success(`create template cdoe :${tplcode}    name:${tplname} successfully`);
};
//# sourceMappingURL=command-tpl.js.map