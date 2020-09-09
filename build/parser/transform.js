"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * es6 转 es5
 */
const babel = __importStar(require("@babel/core"));
exports.transform = (srcCode) => {
    const result = babel.transform(srcCode, { presets: ["es2015"] });
    if (!result) {
        throw new Error("Failed to transpile source code");
    }
    return result.code;
};
//# sourceMappingURL=transform.js.map