import chalk from "chalk";
const name = "[EICA]";

export default function log () {
  const args = Array.prototype.slice.call(arguments);
  const sig = chalk.green(name);
  args.unshift(sig);
  console.log.apply(console, args);
  return this;
};

log.error = function error () {
  const args = Array.prototype.slice.call(arguments);
  const sig = chalk.green(name) + chalk.red(" Error !");
  args.unshift(sig);
  console.trace.apply(console, args);
  return this;
}