import { _ } from "marionext-lodash";

// Marionette.normalizeMethods
// ----------------------

// Pass in a mapping of events => functions or function names
// and return a mapping of events => functions
type normalizeMethods = (hash: any) => any;
const normalizeMethods: normalizeMethods = function (hash) {
  if (!hash) {
    return;
  }

  return _.reduce(
    hash,
    (normalizedHash, method, name) => {
      if (!_.isFunction(method)) {
        method = this[method];
      }
      if (method) {
        normalizedHash[name] = method;
      }
      return normalizedHash;
    },
    {}
  );
};

export { normalizeMethods };
