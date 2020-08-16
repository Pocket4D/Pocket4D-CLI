import fs, { FSWatcher } from "fs";
import path from "path";
import net, { Server, Socket } from "net";
import os from "os";
import watch from "node-watch";
import chalk from "chalk";
import { PDParser } from "../parser/parser";

function _getLocalIP() {
  const osType = os.type(); //系统类型
  const netInfo = os.networkInterfaces(); //网络信息
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
  } else {
    ip = "127.0.0.1";
  }
  console.log(chalk.green(`local ip:${ip}`));

  return ip;
}

export class Watcher {
  dir: string;
  watcher: FSWatcher | null;
  server: Server | null;
  socket: Socket | null;

  constructor(targetPath: string) {
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
    } catch (error) {
      console.log(chalk.red(error));
    }
  }
  _createServer() {
    this.server = net.createServer((socket) => {
      const client = socket.remoteAddress + ":" + socket.remotePort;
      console.log(`Accept new connection from client ${client}`);

      //received data from client
      socket.on("data", function (data) {
        console.log(chalk.yellow(`Received data from client: ${data}`));
      });
      //the end event of socket
      socket.on("end", function () {
        console.log(chalk.red("Client disconnected."));
      });
      socket.on("close", function () {
        console.log(chalk.red("Client close."));
      });
      socket.on("error", function (err) {
        console.log(chalk.red("Client error."));
      });
      socket.on("timeout", function () {
        console.log(chalk.red("Client timeout."));
      });

      this.socket = socket;
    });

    //start listen a port
    this.server.listen(9999, _getLocalIP(), () => {
      // Get server address info.
      // @ts-ignore
      var serverInfo = this.server.address();

      var serverInfoJson = JSON.stringify(serverInfo);

      console.log(
        chalk.green("TCP server listen on address : " + serverInfoJson)
      );

      // @ts-ignore
      this.server.on("close", function () {
        console.log(chalk.red("TCP server socket is closed."));
      });

      // @ts-ignore
      this.server.on("error", function (error) {
        console.error(chalk.red(JSON.stringify(error)));
      });
    });
  }

  _createWatcher() {
    /**
     * https://www.npmjs.com/package/node-watch
     */
    let that = this;
    let watcher = watch(
      this.dir,
      {
        recursive: true,
        filter: (f) => {
          if (/node_modules\/|temp\/|node_modules\\|temp\\/.test(f)) {
            //match unix or windows path
            return false;
          }
          return /\.js$|\.config$|\.html|\.css$/.test(f); //only observe js,html,css,config content
        },
      },
      function (evt, name) {
        that._fileHandler(name);
        console.log(chalk.yellow(`${name} changed.`));
      }
    );

    watcher.on("error", function (err) {
      // handle error
      console.log(chalk.red(err.message));
    });

    watcher.on("ready", function () {
      // the watcher is ready to respond to changes
      console.log(chalk.green(`watch dir:${that.dir}`));
    });
    this.watcher = watcher;
  }

  async _fileHandler(filePath: string) {
    if (path.extname(filePath) === ".js" && filePath.endsWith(".bundle.js")) {
      filePath = path.resolve(
        ".",
        "src",
        path.basename(filePath, ".bundle.js") + ".html"
      );
    }
    //complie html file
    let htmlfile = filePath,
      ext = path.extname(filePath);
    if (ext !== ".html") {
      htmlfile = path.join(
        path.dirname(htmlfile),
        path.basename(htmlfile, ext) + ".html"
      );
    }
    if (fs.existsSync(htmlfile) === false) {
      console.log(chalk.red(`File ${htmlfile} not exits.Ignore complie.`));
      return;
    }

    await new PDParser(htmlfile).parse();

    //send json file to client
    let json_name = path.basename(filePath);
    json_name = json_name.replace(path.extname(filePath), "");

    let jsonPath = filePath.replace(path.extname(filePath), ".json");
    let json_content = fs.readFileSync(jsonPath).toString();
    let res = JSON.stringify({
      pageCode: json_name,
      content: json_content,
    });
    if (this.socket == null) {
      console.log(
        chalk.yellow(`Client not connected.changed file: ${jsonPath}`)
      );
      return;
    }
    //write content length
    let buffer = Buffer.alloc(4);
    buffer.writeInt32LE(res.length); //convert to little-endian
    this.socket.write(buffer);

    //write content
    this.socket.write(res);

    console.log(chalk.yellow("Socket send data: " + filePath));
  }
}
