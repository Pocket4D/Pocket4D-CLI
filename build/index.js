#!/usr/bin/env node
"use strict";
/**
 * use example :
 * node index.js c -e dev -d /Users/xxx/Documents/npm/demo
 * node index.js zip -p /Users/xxx/Documents/npm/demo
 */
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
const yargs_1 = __importDefault(require("yargs"));
const start_1 = require("./commands/start");
const command_tpl_1 = require("./generator/command-tpl");
const zip_1 = require("./util/zip");
const watch_1 = require("./util/watch");
const logger = __importStar(require("./util/logger"));
const argv = yargs_1.default
    .command('tpl', '创建页面', (yargs) => {
    //可选参数
    return yargs
        .option('name', {
        alias: 'n',
        describe: '指定页面名称',
    })
        .option('code', {
        alias: 'c',
        describe: '指定页面code',
    });
}, function (argv) {
    let { code, name } = argv;
    if (!code) {
        logger.fatal(`请用--code参数指定页面名字`);
        return;
    }
    if (!name) {
        logger.fatal(`请用--name 参数指定页面名字`);
        return;
    }
    command_tpl_1.createTemplate(code, name);
})
    .command('watch', '开启实时编译', function (yargs) {
    //可选参数
    return yargs.option('help', {
        alias: 'h',
        describe: '查看帮助',
    });
}, function () {
    let dir = path_1.default.resolve('.');
    new watch_1.Watcher(dir).start();
})
    .command('build', '编译工程', function (yargs) {
    //可选参数
    return yargs.option('help', {
        alias: 'h',
        describe: '查看帮助',
    });
}, function () {
    let dir = path_1.default.resolve('.', 'src');
    start_1.start({ d: dir });
})
    .command('zip', 'zip压缩模板文件', (yargs) => {
    //可选参数
    return yargs
        .option('path', {
        alias: 'p',
        describe: '文件路径或目录',
    })
        .example(
    //示例
    'p4d-cli -p /xxx/tpl', '压缩/xxx/tpl目录下的模板文件')
        .example(
    //示例
    'p4d-cli -p /xxx/tpl/xxx.html', '压缩/xxx/tpl/xxx的模板文件');
}, function (argv) {
    if (argv.path) {
        zip_1.zip(argv.path);
    }
})
    .help('help').argv;
(function () {
    if (argv.v) {
        //查看版本号
        let json = require('../package.json');
        console.log(json.version);
    }
})();
//# sourceMappingURL=index.js.map