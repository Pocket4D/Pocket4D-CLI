#!/usr/bin/env node
/**
 * use example :
 * node index.js c -e dev -d /Users/xxx/Documents/npm/demo
 * node index.js zip -p /Users/xxx/Documents/npm/demo
 */

import path from 'path';
import yargs, { Arguments, Argv } from 'yargs';
import { start } from './commands/start';
import { createTemplate } from './generator/command-tpl';
import { zip } from './util/zip';
import { Watcher } from './util/watch';
import * as logger from './util/logger';

const argv = yargs
	.command(
		'tpl',
		'创建页面',
		(yargs) => {
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
		},
		function (argv: Arguments<any>) {
			let { code, name } = argv;
			if (!code) {
				logger.fatal(`请用--code参数指定页面名字`);
				return;
			}
			if (!name) {
				logger.fatal(`请用--name 参数指定页面名字`);
				return;
			}
			createTemplate(code, name);
		}
	)
	.command(
		'watch',
		'开启实时编译',
		function (yargs: Argv<any>) {
			//可选参数
			return yargs.option('help', {
				alias: 'h',
				describe: '查看帮助',
			});
		},
		function () {
			let dir = path.resolve('.');
			new Watcher(dir).start();
		}
	)
	.command(
		'build',
		'编译工程',
		function (yargs: Argv<any>) {
			//可选参数
			return yargs.option('help', {
				alias: 'h',
				describe: '查看帮助',
			});
		},
		function () {
			let dir = path.resolve('.', 'src');
			start({ d: dir });
		}
	)
	.command(
		'zip',
		'zip压缩模板文件',
		(yargs) => {
			//可选参数
			return yargs
				.option('path', {
					alias: 'p',
					describe: '文件路径或目录',
				})
				.example(
					//示例
					'p4d-cli -p /xxx/tpl',
					'压缩/xxx/tpl目录下的模板文件'
				)
				.example(
					//示例
					'p4d-cli -p /xxx/tpl/xxx.html',
					'压缩/xxx/tpl/xxx的模板文件'
				);
		},
		function (argv) {
			if (argv.path) {
				zip(argv.path as string);
			}
		}
	)
	.help('help').argv;

(function () {
	if (argv.v) {
		//查看版本号
		let json = require('../package.json');
		console.log(json.version);
	}
})();
