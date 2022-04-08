import path from "path";
import { rollup } from "rollup";
import { filename } from "dirname-filename-esm";

import rollupTypescript from "rollup-plugin-ts";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";

import config from "./config.js";
import log from "./utils/log.js";
import duration from "./utils/duration.js";

export function bundleMain() {
  const START = process.hrtime();
  const aliasPluginOptions = {
    resolve: [".ts"],
    entries: config.get("packages").map((pkg) => {
      return {
        find: pkg.name,
        replacement: pkg.main
      };
    })
  };

  return new Promise((resolve) => {
    return rollup({
      input: config.get("main.src"),
      // onwarn: (warning) => { throw new Error(warning.message) },
      plugins: [
        nodeResolve(),
        alias(aliasPluginOptions),
        rollupTypescript({
          transpileOnly: false,
          hook: {
            diagnostics: (diagnostics) => console.log(diagnostics)
          },
          verbosity: 10,
          tsconfig: path.join(config.get("rootPath"), "tsconfig.json")
        })
      ]
    })
      .then((bundle) => {
        return bundle.write({
          file: config.get("main.outJs"),
          format: "esm"
        });
      })
      .catch((err) => {
        console.dir(err);
        const error = new Error(
          `rollup failed to build the ${config.get("main.outJs")} file:\n${err}`
        );
        error.file = filename(import.meta);
        throw error;
      })
      .then(() => {
        log(
          `The file ${path.relative(
            config.get("rootPath"),
            config.get("main.outJs")
          )} has been succesfully bundled.`,
          duration(START)
        );
      });
  });
}
