var chalk = require("chalk");
var format = require("util").format;

const PREFIX = "   pd-cli";
const SEP = chalk.gray("·");

/**
 * Log a `message` to the console.
 *
 * @param {String} msg
 */

export const log = (msg: string) => {
  const formatted = format.apply(format, msg);
  console.log(chalk.white(PREFIX), SEP, formatted);
};

/**
 * Log an error `message` to the console and exit.
 *
 * @param {String} msg
 */

export const fatal = (msg: string) => {
  const formatted = format.apply(format, msg.trim());
  console.error(chalk.red(PREFIX), SEP, msg);
  process.exit(1);
};

/**
 * Log a success `message` to the console and exit.
 *
 * @param {String} msg
 */

export const success = (msg: string) => {
  const formatted = format.apply(format, msg);
  console.log(chalk.green(PREFIX), SEP, formatted);
};
