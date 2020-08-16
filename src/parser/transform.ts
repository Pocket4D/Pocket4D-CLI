/**
 * es6 转 es5
 */
import * as babel from "@babel/core";

export const transform = (srcCode: string) => {
  const result = babel.transform(srcCode, { presets: ["es2015"] });

  if (!result) {
    throw new Error("Failed to transpile source code");
  }

  return result.code;
};
