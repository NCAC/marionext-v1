import { _ } from "marionext-lodash";

type _setOptions = (options: ObjectHash, classOptions: string[]) => void;
const _setOptions: _setOptions = function (options, classOptions) {
  this.options = Object.assign({}, _.result(this, "options"), options);
  this.mergeOptions(options, classOptions);
};

export { _setOptions };
