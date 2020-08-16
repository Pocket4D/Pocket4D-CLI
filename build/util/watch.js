"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Watcher = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const net_1 = __importDefault(require("net"));
const os_1 = __importDefault(require("os"));
const node_watch_1 = __importDefault(require("node-watch"));
const chalk_1 = __importDefault(require("chalk"));
const parser_1 = require("../parser/parser");
function _getLocalIP() {
    const osType = os_1.default.type(); //系统类型
    const netInfo = os_1.default.networkInterfaces(); //网络信息
    let ip = "";
    if (osType === "Windows_NT") {
        for (let dev in netInfo) {
            if (dev === "本地连接") {
                // @ts-ignore
                for (let j = 0; j < netInfo[dev].length; j++) {
                    // @ts-ignore
                    if (netInfo[dev][j].family === "IPv4") {
                        // @ts-ignore
                        ip = netInfo[dev][j].address;
                        break;
                    }
                }
            }
        }
    }
    else {
        ip = "127.0.0.1";
    }
    console.log(chalk_1.default.green(`local ip:${ip}`));
    return ip;
}
class Watcher {
    constructor(targetPath) {
        this.dir = targetPath;
        this.watcher = null;
        this.server = null;
        this.socket = null;
    }
    /**
     * 开启监听模板修改
     * @param {监听模板目录} dir
     */
    start() {
        if (!this.dir) {
            throw new Error("dir is null");
        }
        this._createWatcher();
        this._createServer();
    }
    /**
     * stop watch file
     */
    stop() {
        try {
            //close watch
            // @ts-ignore
            this.watcher.close();
            //close server
            this.socket = null;
            if (this.server) {
                this.server.close();
            }
        }
        catch (error) {
            console.log(chalk_1.default.red(error));
        }
    }
    _createServer() {
        this.server = net_1.default.createServer((socket) => {
            const client = socket.remoteAddress + ":" + socket.remotePort;
            console.log(`Accept new connection from client ${client}`);
            //received data from client
            socket.on("data", function (data) {
                console.log(chalk_1.default.yellow(`Received data from client: ${data}`));
            });
            //the end event of socket
            socket.on("end", function () {
                console.log(chalk_1.default.red("Client disconnected."));
            });
            socket.on("close", function () {
                console.log(chalk_1.default.red("Client close."));
            });
            socket.on("error", function (err) {
                console.log(chalk_1.default.red("Client error."));
            });
            socket.on("timeout", function () {
                console.log(chalk_1.default.red("Client timeout."));
            });
            this.socket = socket;
        });
        //start listen a port
        this.server.listen(9999, _getLocalIP(), () => {
            // Get server address info.
            // @ts-ignore
            var serverInfo = this.server.address();
            var serverInfoJson = JSON.stringify(serverInfo);
            console.log(chalk_1.default.green("TCP server listen on address : " + serverInfoJson));
            // @ts-ignore
            this.server.on("close", function () {
                console.log(chalk_1.default.red("TCP server socket is closed."));
            });
            // @ts-ignore
            this.server.on("error", function (error) {
                console.error(chalk_1.default.red(JSON.stringify(error)));
            });
        });
    }
    _createWatcher() {
        /**
         * https://www.npmjs.com/package/node-watch
         */
        let that = this;
        let watcher = node_watch_1.default(this.dir, {
            recursive: true,
            filter: (f) => {
                if (/node_modules\/|temp\/|node_modules\\|temp\\/.test(f)) {
                    //match unix or windows path
                    return false;
                }
                return /\.js$|\.config$|\.html|\.css$/.test(f); //only observe js,html,css,config content
            },
        }, function (evt, name) {
            that._fileHandler(name);
            console.log(chalk_1.default.yellow(`${name} changed.`));
        });
        watcher.on("error", function (err) {
            // handle error
            console.log(chalk_1.default.red(err.message));
        });
        watcher.on("ready", function () {
            // the watcher is ready to respond to changes
            console.log(chalk_1.default.green(`watch dir:${that.dir}`));
        });
        this.watcher = watcher;
    }
    _fileHandler(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (path_1.default.extname(filePath) === ".js" && filePath.endsWith(".bundle.js")) {
                filePath = path_1.default.resolve(".", "src", path_1.default.basename(filePath, ".bundle.js") + ".html");
            }
            //complie html file
            let htmlfile = filePath, ext = path_1.default.extname(filePath);
            if (ext !== ".html") {
                htmlfile = path_1.default.join(path_1.default.dirname(htmlfile), path_1.default.basename(htmlfile, ext) + ".html");
            }
            if (fs_1.default.existsSync(htmlfile) === false) {
                console.log(chalk_1.default.red(`File ${htmlfile} not exits.Ignore complie.`));
                return;
            }
            yield new parser_1.PDParser(htmlfile).parse();
            //send json file to client
            let json_name = path_1.default.basename(filePath);
            json_name = json_name.replace(path_1.default.extname(filePath), "");
            let jsonPath = filePath.replace(path_1.default.extname(filePath), ".json");
            let json_content = fs_1.default.readFileSync(jsonPath).toString();
            let res = JSON.stringify({
                pageCode: json_name,
                content: json_content,
            });
            if (this.socket == null) {
                console.log(chalk_1.default.yellow(`Client not connected.changed file: ${jsonPath}`));
                return;
            }
            //write content length
            let buffer = Buffer.alloc(4);
            buffer.writeInt32LE(res.length); //convert to little-endian
            this.socket.write(buffer);
            //write content
            this.socket.write(res);
            console.log(chalk_1.default.yellow("Socket send data: " + filePath));
        });
    }
}
exports.Watcher = Watcher;
//# sourceMappingURL=watch.js.map