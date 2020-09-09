"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const parser_1 = require("../parser/parser");
const watch_1 = require("../util/watch");
// TODO: this doesn't do anything, but should zip/package the final build artifact.
const pwpackage = (..._) => {
    return Promise.resolve();
};
exports.start = (argv) => __awaiter(this, void 0, void 0, function* () {
    if (argv.e && argv.e === 'dev') {
        try {
            let dir = argv.d || argv.f;
            if (fs_1.default.statSync(dir).isFile()) {
                dir = path_1.default.dirname(dir);
            }
            let w = new watch_1.Watcher(dir);
            w.start();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    if (argv.d) {
        //编译目录
        let { d, e } = argv;
        if (argv.e && argv.e != 'dev') {
            yield pwpackage(d, 'build');
        }
        let dir = d;
        if (dir) {
            var paths = fs_1.default.readdirSync(dir).filter((value, i) => {
                return value.endsWith('.html');
            });
            paths.forEach((v, i) => {
                let fullpath = path_1.default.join(dir, v);
                new parser_1.P4DParser(fullpath).parse();
            });
        }
        return Promise.resolve();
    }
    else if (argv.f) {
        //编译单个文件
        let { f, e } = argv;
        let dir = path_1.default.dirname(f);
        if (argv.env && argv.env != 'dev') {
            yield pwpackage(dir, 'build');
        }
        return yield new parser_1.P4DParser(f).parse();
    }
    else {
        console.log(chalk_1.default.red('请用--f指定模板文件或用--d指定模板目录\n'));
        return Promise.resolve();
    }
});
//# sourceMappingURL=start.js.map