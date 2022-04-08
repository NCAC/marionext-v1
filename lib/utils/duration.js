import chalk from "chalk";
import prettyTime from "pretty-hrtime";

export default (start) => {
  return chalk.magenta(prettyTime(process.hrtime(start)));
};