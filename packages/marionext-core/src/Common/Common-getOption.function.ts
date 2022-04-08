// Marionette.getOptions
// --------------------

type getOptions = (optionName: string) => any;
// Retrieve an object, function or other value from the
// object or its `options`, with `options` taking precedence.

const getOptions: getOptions = function (optionName: string) {
  if (!optionName) { return; }
  if (this.options && (this.options[optionName] !== undefined)) {
    return this.options[optionName];
  } else {
    return this[optionName];
  }
};

export { getOptions };
