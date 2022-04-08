// Merge `keys` from `options` onto `this`
type mergeOptions = (options: ObjectHash, keys: any[]) => void;

const mergeOptions: mergeOptions = function (options, keys: any[]) {
  if (!options) { return; }

  keys.forEach(key => {
    const option = options[key];
    if (option !== undefined) {
      this[key] = option;
    }
  });
};

export { mergeOptions };
