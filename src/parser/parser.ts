import fs from "fs";
import path from "path";
import htmlparser from "htmlparser2";
import shadyCss, { nodeType } from "shady-css-parser";
import chalk from "chalk";

import * as logger from "../util/logger";
import { transform } from "./transform";

/**
 * link table,to point node relationship
 */
class Node<T> {
  prev: Node<T> | null;
  next: Node<T> | null;
  data: T | null;

  constructor() {
    this.prev = null; //prev node
    this.next = null; //next node
    this.data = null; //node's data
  }
}

export class PDParser {
  file: string = "";
  dir: string = "";
  result: Record<any, any> = {};

  constructor(srcPath: string) {
    if (fs.lstatSync(srcPath).isFile()) {
      this.file = srcPath;
      this.dir = path.dirname(srcPath);
    }
  }

  /**
   * entry point
   */
  async parse() {
    if (this.file) {
      //read file
      return await this.parseFile(this.file).then((content) => {
        let jsonpath = this.file.replace(path.extname(this.file), ".json");
        fs.writeFileSync(jsonpath, content);
      });
    }
    return Promise.reject(new Error("file not exits"));
  }

  async parseFile(filePath: string): Promise<string> {
    let content = fs.readFileSync(filePath).toString();
    if (!content || content.length == 0) {
      return Promise.reject("file content is empty.");
    }
    console.log(chalk.yellow(`Compling file ${filePath}.\n`));

    return this.parseHTMLContent(content);
  }

  /**
   * parse css to json object
   * https://www.npmjs.com/package/shady-css-parser
   * @param {css text content} css
   */
  parseCSS(css: string) {
    let result: { [key: string]: any } = {};

    if (!css) {
      return result;
    }

    // process contains expression like {{}}
    if (css.includes("{{")) {
      const regex1 = RegExp(/(?<name>.*?):(?<value>.*?);/, "g"); //非贪婪匹配
      let array1 = css.match(regex1);
      try {
        while (array1 !== null && array1.groups) {
          const { name, value } = array1.groups;
          result[name] = value;
        }
      } catch (error) {}
      return result;
    }

    //other css
    const parser = new shadyCss.Parser();
    const ast = parser.parse(css);

    ast.rules.forEach((rule) => {
      if (rule.type === "ruleset") {
        const rulelist: Record<string, string> = {};

        rule.rulelist.rules.forEach((v) => {
          // TODO: this should be fixed. this means we only support single-level CSS.j
          if (
            v.type === nodeType.declaration &&
            v.value?.type === nodeType.expression
          ) {
            rulelist[v.name] = v.value.text;
          }
        });

        result[rule.selector] = rulelist;
      } else if (
        rule.type === "declaration" &&
        rule.value?.type === nodeType.expression
      ) {
        result[rule.name] = rule.value.text;
      } else if (rule.type === "atRule") {
        //@
        if (rule.name == "import") {
          //handle import css
          let p = rule.parameters.replace(/"/g, "");
          let filePath = path.join(this.dir, p);
          result = this.parseCSSFile(filePath);
        }
      }
    });

    return result;
  }
  /**
   * parse css file
   * @param {*} filePath
   */
  parseCSSFile(filePath: string) {
    // TODO: this should throw an error, but we need this prototype to work right now so fuck it.
    if (!fs.existsSync(filePath)) {
      return {};
    }
    let css = fs.readFileSync(filePath).toString();

    return this.parseCSS(css);
  }

  /**
   * html node json body builder
   * @param {*} tag
   * @param {*} inner_html
   * @param {*} child_nodes
   */
  jsonBody(tag = "", inner_html = "", child_nodes = []) {
    return {
      tag: tag,
      innerHTML: inner_html,
      childNodes: child_nodes,
      datasets: {},
      events: {},
      directives: {},
      attribStyle: {},
      attrib: {},
    };
  }
  /**
   * 处理属性集合
   * @param {属性集合} attribs
   * @param {节点数据} node
   */
  handleAttributes(attribs: Record<any, any>, node: any) {
    let that = this;
    Object.keys(attribs).forEach((o, i) => {
      that.handleAttribute(o, attribs[o], node);
    });
    that.handleAttributeFinal(node);
  }
  /**
   * 处理属性
   * @param {attribute name} name 属性名
   * @param {attitude value} value 属性值
   * @param {节点数据} node data
   */
  handleAttribute(name: string, value: string, node: any) {
    if (!node || !name) {
      return;
    }
    if (name === "id") {
      //id
      node[name] = value;
    } else if (name === "class") {
      //class
      node["className"] = value;
    } else if (name.indexOf("bind") == 0) {
      //events
      node["events"][name] = value;
    } else if (name.indexOf("pd:") == 0) {
      //directives
      if (!node["repeatDirective"]) {
        node["repeatDirective"] = {};
      }
      if (!node["shownDirective"]) {
        node["shownDirective"] = {};
      }
      let repeatDirective = node["repeatDirective"],
        shownDirective = node["shownDirective"];
      let name_ = name.substr(4),
        attr = name.trim();
      if (attr.indexOf("pd:for") == 0) {
        if (attr == "pd:for") {
          repeatDirective["name"] = name_;
          repeatDirective["expression"] = value;
        } else if (attr == "pd:for-item") {
          repeatDirective["item"] = value;
        } else if (attr == "pd:for-index") {
          repeatDirective["index"] = value;
        }
      } else if (attr == "pd:if") {
        shownDirective["name"] = name_;
        shownDirective["expression"] = value;
      } else if (attr == "pd:elif") {
        shownDirective["name"] = name_;
        shownDirective["expression"] = value;
      } else if (attr == "pd:else") {
        shownDirective["name"] = name_;
        shownDirective["expression"] = value;
      }
    } else if (name == "src") {
      //attribStyle
      node["attribStyle"][name.trim()] = value.trim();
    } else if (name == "style") {
      //handleAttribute
      let styles = this.parseCSS(value);
      try {
        for (let n in styles) {
          node["attribStyle"][n.trim()] = styles[n].trim();
        }
      } catch (error) {
        logger.fatal(error);
      }
    } else {
      //attrib
      node["attrib"][name] = value;
    }
    //dataset
    if (name.includes("data-")) {
      let dn = name.substr(8);
      node["datasets"][dn] = value;
    }
  }
  /**
   * 对属性做最后处理
   * @param {节点} node
   */
  handleAttributeFinal(node: any) {
    //handle directives
    let directives: { [key: string]: any } = {};

    if (
      node["repeatDirective"] &&
      Object.keys(node["repeatDirective"]).length > 0
    ) {
      let keys = Object.keys(node["repeatDirective"]);
      if (keys.includes("item") === false) {
        node["repeatDirective"]["item"] = "item";
      }
      if (keys.includes("index") === false) {
        node["repeatDirective"]["index"] = "index";
      }
      directives["repeat"] = node["repeatDirective"];
    }
    delete node["repeatDirective"];
    //shown
    if (
      node["shownDirective"] &&
      Object.keys(node["shownDirective"]).length > 0
    ) {
      directives["shown"] = node["shownDirective"];
    }
    delete node["shownDirective"];

    node["directives"] = directives;
  }

  _readFile(filepath: string) {
    if (!filepath || !filepath.length) {
      return null;
    }

    return fs.readFileSync(filepath).toString();
  }

  /**
   * handle extend script(a single js file for support webpack)
   */
  _handleScriptExtend() {
    let jsfile = path.resolve(
      ".",
      "dist",
      path.basename(this.file).replace(".html", ".bundle.js")
    );
    //let jsfile = this.file.replace('.html', '.js');
    try {
      if (fs.existsSync(jsfile) === false) {
        logger.log(`bundle.js not exits:${jsfile}`);
        return;
      }
    } catch (error) {
      return;
    }
    let jscontent = this._readFile(jsfile);
    if (!jscontent || jscontent.length == 0) {
      return;
    }

    //base64 encode
    jscontent = this._base64Str(jscontent) || "";

    this.result["script"] = jscontent;
  }

  _handleScript(str1: string) {
    //es6 to es5
    str1 = transform(str1) || "";
    //导出function
    var regex1 = RegExp(/function\s*(?<funame>\w\S+?)\s*?\(.*?\)/, "g");
    let expstr = "";
    const array1 = str1.match(regex1);
    try {
      while (array1 !== null) {
        console.log(
          `Found ${array1.groups?.funame}. Next starts at ${regex1.lastIndex}.`
        );

        // TODO: handle undefined groups
        expstr += `this["${array1.groups?.funame}"] = ${array1.groups?.funame};\n`;
      }
      console.log(`export result:\n ${expstr}`);
    } catch (error) {}
    str1 += expstr;
    return str1;
  }

  _handleConfig() {
    let configFile = path.resolve(
      ".",
      "src",
      path.basename(this.file).replace(".html", ".config")
    );
    if (fs.existsSync(configFile)) {
      this.result["config"] = JSON.parse(
        fs.readFileSync(configFile).toString()
      );
    }
  }

  /**
   * 对result做最后处理
   */
  handleResultFinal() {
    let result = this.result;
    //style
    let styles = this.parseCSS(result["style"]["innerHTML"]);
    result["style"] = styles || {};

    //script extend
    this._handleScriptExtend();

    //config
    this._handleConfig();
  }

  _base64Str(text: string) {
    let buffer = new Buffer(text),
      base64Str = buffer.toString("base64");
    return base64Str;
  }

  async parseHTMLContent(content: string) {
    let currentNode: Node<any> | null = null;
    const result = this.result;
    const heads = ["style", "script"];
    const parser = new htmlparser.Parser(
      {
        onopentag: (tagname, attribs) => {
          //create new node,to link parent-child
          let node = new Node();
          node.data = this.jsonBody(tagname);

          if (currentNode !== null) {
            //now, currentNode is prev node
            //save prev node,to be use for prev
            node.prev = currentNode;
            currentNode.data["childNodes"].push(node.data);
          }

          currentNode = node;
          //处理属性
          this.handleAttributes(attribs, currentNode.data);
        },
        ontext: (text) => {
          if (!currentNode) {
            return;
          }
          var innerText = text;
          let tagname = currentNode.data["tag"];
          if (tagname != "style") {
            innerText = innerText.trim();
          }
          currentNode.data["innerHTML"] += innerText;
        },
        onclosetag: (tagname) => {
          if (!currentNode) throw new Error("No opening tag!");

          if (tagname != "style") {
            let content = currentNode.data["innerHTML"];
            if (tagname == "script") {
              content = this._handleScript(content);
            }
            currentNode.data["innerHTML"] = this._base64Str(content);
          }

          if (
            currentNode.prev &&
            currentNode.prev.data["tag"] == "head" &&
            heads.includes(tagname)
          ) {
            //move to top position
            result[tagname] = currentNode.data;
          } else if (
            currentNode.prev &&
            currentNode.prev.data["tag"] == "html" &&
            tagname == "body"
          ) {
            //move to top position
            result[tagname] = currentNode.data;
          }

          //when meet close tag,parent node is current node's prev node
          currentNode = currentNode.prev;
        },
        onend: () => {
          this.handleResultFinal();
          console.log(chalk.yellow(JSON.stringify(result) + "\n"));
          console.log(chalk.green(`Parse file ${this.file} done.\n`));
        },
      },
      { decodeEntities: true }
    );
    parser.write(content);
    parser.end();
    await parser;

    return Promise.resolve(JSON.stringify(result));
  }
}
