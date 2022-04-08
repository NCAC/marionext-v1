import config from "./lib/config.js";
import getPackages from "./lib/getPackages.js";
import { bundleMain } from "./lib/bundleMain.js";

config.init();
getPackages().then(() => {
  return bundleMain();
});
