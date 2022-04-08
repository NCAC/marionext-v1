import { _ } from "marionext-lodash";

const MnError = (function () {
  const errorProps = [
    "description",
    "fileName",
    "lineNumber",
    "name",
    "message",
    "number",
    "url"
  ];
  return class MnError extends Error {
    constructor(options) {
      super(options.message);
      const error = Error.call(this, options.message);
      Object.assign(
        this,
        _.pick(error, errorProps),
        _.pick(options, errorProps)
      );
      if ((Error as any).captureStackTrace) {
        this.captureStackTrace();
      }
    }
    captureStackTrace() {
      (Error as any).captureStackTrace(this, MnError);
    }
    toString() {
      return `${this.name}: ${this.message}`;
    }
  };
})();

export { MnError };
