import fileSystem from "fs-extra";
import path from "path";
import config from "./config.js";
const rootPath = config.get("rootPath");

function getPackagesFolder() {
  const pathToCheck = path.resolve(rootPath, "packages");
  return new Promise((resolve, reject) => {
    fileSystem
      .readdir(pathToCheck)
      .then(files => {
        return Promise.all(
          files.map(async (file) => {
            // const folder
            const stat = await fileSystem.stat(path.join(pathToCheck, file));
            if (stat.isDirectory()) {
              return file;
            }
          })
        );
      })
      .catch(reject)
      .then(packages => {
        return Promise.all(
          packages.map(async (pkg) => {
            const packagePath = path.join(pathToCheck, pkg);
            const definition = await fileSystem.readJSON(
              path.join(packagePath, "package.json")
            );
            return {
              path: packagePath,
              definition: definition
            };
          })
        );
      })
      .catch(reject)
      .then(packages => {
        resolve(packages);
      });
  });
}

function getPackagesPaths(packages) {
  return new Promise((resolve, reject) => {
    try {
      let configPackages = [];
      packages.forEach((pkg) => {
        configPackages.push({
          name: pkg.definition.importName,
          path: pkg.path,
          main: path.join(pkg.path, pkg.definition.main)
        });
      });

      resolve(configPackages)
    } catch (err) {
      reject(err);
    }
  });
}

export default () => {
  return new Promise((resolve, reject) => {
    getPackagesFolder()
      .then(packages => {
        return getPackagesPaths(packages);
      })
      .then(configPackages => {
        config.set("packages", configPackages);
        resolve();
      })
      .catch(reject)
  });
};