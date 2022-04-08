const _ = (function () {
  const asyncTag = "[object AsyncFunction]",
    funcTag = "[object Function]",
    genTag = "[object GeneratorFunction]",
    proxyTag = "[object Proxy]",
    nullTag = "[object Null]",
    undefinedTag = "[object Undefined]",
    argsTag = "[object Arguments]",
    arrayTag = "[object Array]",
    objectTag = "[object Object]",
    mapTag = "[object Map]",
    setTag = "[object Set]",
    weakMapTag = "[object WeakMap]",
    boolTag = "[object Boolean]",
    dateTag = "[object Date]",
    errorTag = "[object Error]",
    numberTag = "[object Number]",
    regexpTag = "[object RegExp]",
    stringTag = "[object String]";
  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag] =
    cloneableTags[arrayTag] =
    cloneableTags[boolTag] =
    cloneableTags[dateTag] =
    cloneableTags[mapTag] =
    cloneableTags[numberTag] =
    cloneableTags[objectTag] =
    cloneableTags[regexpTag] =
    cloneableTags[setTag] =
    cloneableTags[stringTag] =
      true;
  cloneableTags[errorTag] =
    cloneableTags[funcTag] =
    cloneableTags[weakMapTag] =
      false;
  const nativeNow = Date.now;
  const HOT_COUNT = 800,
    HOT_SPAN = 16;
  const nativeMax = Math.max;
  const nativeMin = Math.min;
  const nativeFloor = Math.floor;
  const nativeRandom = Math.random;
  const objectCreate = Object.create;
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
  const funcToString = Function.prototype.toString;
  const objectCtorString = funcToString.call(Object);
  const nativeObjectToString = Object.prototype.toString;
  const nativeKeys = overArg(Object.keys, Object);
  const reIsDeepProp = /\.|\[(?:[^[\]]*|(['"])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/,
    rePropName =
      /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
    reEscapeChar = /\\(\\)?/g,
    reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
    reIsNative = RegExp(
      "^" +
        funcToString
          .call(hasOwnProperty)
          .replace(reRegExpChar, "\\$&")
          .replace(
            /hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,
            "$1.*?"
          ) +
        "$"
    ),
    reIsHostCtor = /^\[object .+?Constructor\]$/,
    reIsUint = /^(?:0|[1-9]\d*)$/,
    reFlags = /\w*$/,
    rsAstralRange = "\\ud800-\\udfff",
    rsComboMarksRange = "\\u0300-\\u036f",
    reComboHalfMarksRange = "\\ufe20-\\ufe2f",
    rsComboSymbolsRange = "\\u20d0-\\u20ff",
    rsComboRange =
      rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = "\\ufe0e\\ufe0f",
    rsZWJ = "\\u200d",
    reHasUnicode = RegExp(
      "[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]"
    ),
    rsAstral = "[" + rsAstralRange + "]",
    rsCombo = "[" + rsComboRange + "]",
    rsFitz = "\\ud83c[\\udffb-\\udfff]",
    rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")",
    rsNonAstral = "[^" + rsAstralRange + "]",
    rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}",
    rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]",
    reOptMod = rsModifier + "?",
    rsOptVar = "[" + rsVarRange + "]?",
    rsOptJoin =
      "(?:" +
      rsZWJ +
      "(?:" +
      [rsNonAstral, rsRegional, rsSurrPair].join("|") +
      ")" +
      rsOptVar +
      reOptMod +
      ")*",
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol =
      "(?:" +
      [
        rsNonAstral + rsCombo + "?",
        rsCombo,
        rsRegional,
        rsSurrPair,
        rsAstral
      ].join("|") +
      ")",
    /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
    reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g"),
    reTrim = /^\s+|\s+$/g,
    reIsBadHex = /^[-+]0x[0-9a-f]+$/i,
    reIsBinary = /^0b[01]+$/i,
    reIsOctal = /^0o[0-7]+$/i,
    reUnescapedHtml = /[&<>"']/g,
    reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
  /** Used to map characters to HTML entities. */
  const htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  const INFINITY = 1 / 0;
  const MAX_INTEGER = 1.7976931348623157e308;
  const MAX_MEMOIZE_SIZE = 500;
  const MAX_SAFE_INTEGER = 9007199254740991;
  const LARGE_ARRAY_SIZE = 200;
  const NAN = 0 / 0;
  /** Built-in method references without a dependency on `root`. */
  const freeParseInt = parseInt;
  const FUNC_ERROR_TEXT = "Expected a function";
  const HASH_UNDEFINED = "__hash_undefined__";
  const COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4,
    CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2;
  function constant(value) {
    return function () {
      return value;
    };
  }
  const isFunction = function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns "object" for typed arrays and other constructors.
    var tag = baseGetTag(value);
    return (
      tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag
    );
  };
  const nativeCreate = getNative(Object, "create");
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }
  function baseIsNative(value) {
    if (!isObject(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  function toSource(func) {
    if (func != null) {
      try {
        return Function.prototype.toString.call(func);
      } catch (e) {}
      try {
        return func + "";
      } catch (e) {}
    }
    return "";
  }
  class Hash {
    constructor(entries) {
      var index = -1,
        length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    clear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    set(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
      return this;
    }
    has(key) {
      var data = this.__data__;
      return nativeCreate
        ? data[key] !== undefined
        : hasOwnProperty.call(data, key);
    }
    delete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    get(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : undefined;
    }
  }
  class ListCache {
    constructor(entries) {
      var index = -1,
        length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    clear() {
      this.__data__ = [];
      this.size = 0;
    }
    set(key, value) {
      var data = this.__data__,
        index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    delete(key) {
      var data = this.__data__,
        index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        Array.prototype.splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    get(key) {
      var data = this.__data__,
        index = assocIndexOf(data, key);
      return index < 0 ? undefined : data[index][1];
    }
    has(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
  }
  class Stack {
    constructor(entries) {
      var data = (this.__data__ = new ListCache(entries));
      this.size = data.size;
    }
    set(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    get(key) {
      return this.__data__.get(key);
    }
    delete(key) {
      var data = this.__data__,
        result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    clear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    has(key) {
      return this.__data__.has(key);
    }
  }
  class SetCache {
    constructor(values) {
      var index = -1,
        length = values == null ? 0 : values.length;
      this.__data__ = new MapCache();
      while (++index < length) {
        this.add(values[index]);
      }
    }
    add(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }
    has(value) {
      return this.__data__.has(value);
    }
  }
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }
  class MapCache {
    constructor(entries) {
      var index = -1,
        length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    clear() {
      this.size = 0;
      this.__data__ = {
        hash: new Hash(),
        map: new (Map || ListCache)(),
        string: new Hash()
      };
    }
    set(key, value) {
      var data = getMapData(this, key),
        size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    delete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    get(key) {
      return getMapData(this, key).get(key);
    }
    has(key) {
      return getMapData(this, key).has(key);
    }
  }
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key)
      ? data[typeof key == "string" ? "string" : "hash"]
      : data.map;
  }
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "boolean"
      ? value !== "__proto__"
      : value === null;
  }
  const memoize = function (func, resolver) {
    if (
      typeof func != "function" ||
      (resolver != null && typeof resolver != "function")
    ) {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function () {
      var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache)();
    return memoized;
  };
  function memoizeCapped(func) {
    var result = memoize(func, function (key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }
      return key;
    });
    var cache = result.cache;
    return result;
  }
  const stringToPath = memoizeCapped(function (string) {
    var result = [];
    if (string.charCodeAt(0) === 46 /* . */) {
      result.push("");
    }
    string.replace(rePropName, function (match, number, quote, subString) {
      result.push(
        quote ? subString.replace(reEscapeChar, "$1") : number || match
      );
    });
    return result;
  });
  function isPrototype(value) {
    var Ctor = value && value.constructor,
      proto = (typeof Ctor == "function" && Ctor.prototype) || Object.prototype;
    return value === proto;
  }
  function keys(object) {
    if (!isPrototype(object)) {
      return Object.keys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty.call(object, key) && key != "constructor") {
        result.push(key);
      }
    }
    return result;
  }
  function toString(value) {
    return value == null ? "" : baseToString(value);
  }
  function baseToString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == "string") {
      return value;
    }
    if (Array.isArray(value)) {
      // Recursively convert values (susceptible to call stack limits).
      return arrayMap(value, baseToString) + ""; // TODO : make it with native Array.map
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  function arrayMap(array, iteratee) {
    var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);
    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }
  function isNumber(value) {
    return (
      typeof value == "number" ||
      (isObjectLike(value) && baseGetTag(value) == numberTag)
    );
  }
  function isString(value) {
    return (
      typeof value == "string" ||
      (!Array.isArray(value) &&
        isObjectLike(value) &&
        baseGetTag(value) == stringTag)
    );
  }
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  }
  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return (
      typeof Ctor == "function" &&
      Ctor instanceof Ctor &&
      funcToString.call(Ctor) == objectCtorString
    );
  }
  function isRegExp(value) {
    return isObjectLike(value) && baseGetTag(value) == regexpTag;
  }
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }
  function isEmpty(value) {
    if (value == null) {
      return true;
    }
    if (
      isArrayLike(value) &&
      (Array.isArray(value) ||
        typeof value == "string" ||
        typeof value.splice == "function" ||
        isArguments(value))
    ) {
      return !value.length;
    }
    var tag = baseGetTag(value);
    if (tag == mapTag || tag == setTag) {
      return !value.size;
    }
    if (isPrototype(value)) {
      return !keys(value).length;
    }
    for (var key in value) {
      if (hasOwnProperty.call(value, key)) {
        return false;
      }
    }
    return true;
  }
  function isUndefined(value) {
    return value === undefined;
  }
  function isNull(value) {
    return value === null;
  }
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return nativeObjectToString.call(value);
  }
  function castPath(value, object) {
    if (Array.isArray(value)) {
      return value;
    }
    return isKey(value, object) ? [value] : stringToPath(toString(value));
  }
  function isKey(value, object) {
    if (Array.isArray(value)) {
      return false;
    }
    var type = typeof value;
    if (type == "number" || type == "boolean" || value == null) {
      return true;
    }
    return (
      reIsPlainProp.test(value) ||
      !reIsDeepProp.test(value) ||
      (object != null && value in Object(object))
    );
  }
  function toKey(value) {
    if (typeof value == "string") {
      return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  function result(object, path, defaultValue) {
    path = castPath(path, object);
    var index = -1,
      length = path.length;
    // Ensure the loop is entered when path is empty.
    if (!length) {
      length = 1;
      object = undefined;
    }
    while (++index < length) {
      var value = object == null ? undefined : object[toKey(path[index])];
      if (value === undefined) {
        index = length;
        value = defaultValue;
      }
      object = isFunction(value) ? value.call(object) : value;
    }
    return object;
  }
  function baseFor(object, iteratee, keysFunc) {
    var index = -1,
      iterable = Object(object),
      props = keysFunc(object),
      length = props.length;
    while (length--) {
      var key = props[++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  }
  function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
    eachFunc(collection, function (value, index, collection) {
      accumulator = initAccum
        ? ((initAccum = false), value)
        : iteratee(accumulator, value, index, collection);
    });
    return accumulator;
  }
  const baseEach = createBaseEach(baseForOwn);
  function baseForOwn(object, iteratee) {
    return object && baseFor(object, iteratee, keys);
  }
  function createBaseEach(eachFunc) {
    return function (collection, iteratee) {
      if (collection == null) {
        return collection;
      }
      return eachFunc(collection, iteratee);
    };
  }
  function identity(value) {
    return value;
  }
  function getMatchData(object) {
    var result = keys(object),
      length = result.length;
    while (length--) {
      var key = result[length],
        value = object[key];
      result[length] = [key, value, isStrictComparable(value)];
    }
    return result;
  }
  function baseMatches(source) {
    var matchData = getMatchData(source);
    if (matchData.length == 1 && matchData[0][2]) {
      return matchesStrictComparable(matchData[0][0], matchData[0][1]);
    }
    return function (object) {
      return object === source || baseIsMatch(object, source, matchData);
    };
  }
  function baseIsMatch(object, source, matchData, customizer) {
    var index = matchData.length,
      length = index,
      noCustomizer = !customizer;
    if (object == null) {
      return !length;
    }
    object = Object(object);
    while (index--) {
      var data = matchData[index];
      if (
        noCustomizer && data[2]
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
      ) {
        return false;
      }
    }
    while (++index < length) {
      data = matchData[index];
      var key = data[0],
        objValue = object[key],
        srcValue = data[1];
      if (noCustomizer && data[2]) {
        if (objValue === undefined && !(key in object)) {
          return false;
        }
      } else {
        var stack = new Stack();
        if (customizer) {
          var result = customizer(
            objValue,
            srcValue,
            key,
            object,
            source,
            stack
          );
        }
        if (
          !(result === undefined
            ? baseIsEqual(
                srcValue,
                objValue,
                COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG,
                customizer,
                stack
              )
            : result)
        ) {
          return false;
        }
      }
    }
    return true;
  }
  function baseMatchesProperty(path, srcValue) {
    if (isKey(path) && isStrictComparable(srcValue)) {
      return matchesStrictComparable(toKey(path), srcValue);
    }
    return function (object) {
      var objValue = get(object, path);
      return objValue === undefined && objValue === srcValue
        ? hasIn(object, path)
        : baseIsEqual(
            srcValue,
            objValue,
            COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG
          );
    };
  }
  function hasIn(object, path) {
    return object != null && hasPath(object, path, baseHasIn);
  }
  function baseHasIn(object, key) {
    return object != null && key in Object(object);
  }
  function hasPath(object, path, hasFunc) {
    path = castPath(path, object);
    var index = -1,
      length = path.length,
      result = false;
    while (++index < length) {
      var key = toKey(path[index]);
      if (!(result = object != null && hasFunc(object, key))) {
        break;
      }
      object = object[key];
    }
    if (result || ++index != length) {
      return result;
    }
    length = object == null ? 0 : object.length;
    return (
      !!length &&
      isLength(length) &&
      isIndex(key, length) &&
      (Array.isArray(object) || isArguments(object))
    );
  }
  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (
      value == null ||
      other == null ||
      (!isObjectLike(value) && !isObjectLike(other))
    ) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(
      value,
      other,
      bitmask,
      customizer,
      baseIsEqual,
      stack
    );
  }
  function baseIsEqualDeep(
    object,
    other,
    bitmask,
    customizer,
    equalFunc,
    stack
  ) {
    var objIsArr = Array.isArray(object),
      othIsArr = Array.isArray(other),
      objTag = objIsArr ? arrayTag : baseGetTag(object),
      othTag = othIsArr ? arrayTag : baseGetTag(other);
    objTag = objTag == argsTag ? objectTag : objTag;
    othTag = othTag == argsTag ? objectTag : othTag;
    var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack());
      return equalByTag(object, other, objTag);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
      var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;
        stack || (stack = new Stack());
        return equalFunc(
          objUnwrapped,
          othUnwrapped,
          bitmask,
          customizer,
          stack
        );
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack());
    return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
  }
  function equalByTag(
    object,
    other,
    tag,
    bitmask,
    customizer,
    equalFunc,
    stack
  ) {
    switch (tag) {
      case boolTag:
      case dateTag:
      case numberTag:
        // Coerce booleans to `1` or `0` and dates to milliseconds.
        // Invalid dates are coerced to `NaN`.
        return eq(+object, +other);
      case errorTag:
        return object.name == other.name && object.message == other.message;
      case regexpTag:
      case stringTag:
        // Coerce regexes to strings and treat strings, primitives and objects,
        // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
        // for more details.
        return object == other + "";
    }
    return false;
  }
  function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(),
      objLength = objProps.length,
      othProps = getAllKeys(),
      othLength = othProps.length;
    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
        return false;
      }
    }
    // Assume cyclic values are equal.
    var stacked = stack.get(object);
    if (stacked && stack.get(other)) {
      return stacked == other;
    }
    var result = true;
    stack.set(object, other);
    stack.set(other, object);
    var skipCtor = isPartial;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = object[key],
        othValue = other[key];
      if (customizer) {
        var compared = isPartial
          ? customizer(othValue, objValue, key, other, object, stack)
          : customizer(objValue, othValue, key, object, other, stack);
      }
      // Recursively compare objects (susceptible to call stack limits).
      if (
        !(compared === undefined
          ? objValue === othValue ||
            equalFunc(objValue, othValue, bitmask, customizer, stack)
          : compared)
      ) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == "constructor");
    }
    if (result && !skipCtor) {
      var objCtor = object.constructor,
        othCtor = other.constructor;
      // Non `Object` object instances with different constructors are not equal.
      if (
        objCtor != othCtor &&
        "constructor" in object &&
        "constructor" in other &&
        !(
          typeof objCtor == "function" &&
          objCtor instanceof objCtor &&
          typeof othCtor == "function" &&
          othCtor instanceof othCtor
        )
      ) {
        result = false;
      }
    }
    stack["delete"](object);
    stack["delete"](other);
    return result;
  }
  function getAllKeys(object) {
    return function (object) {
      return keys(object);
    };
  }
  function isStrictComparable(value) {
    return value === value && !isObject(value);
  }
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  function isLength(value) {
    return (
      typeof value == "number" &&
      value > -1 &&
      value % 1 == 0 &&
      value <= MAX_SAFE_INTEGER
    );
  }
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return (
      !!length &&
      (type == "number" || (type != "symbol" && reIsUint.test(value))) &&
      value > -1 &&
      value % 1 == 0 &&
      value < length
    );
  }
  var isArguments = baseIsArguments(
    (function () {
      return arguments;
    })()
  )
    ? baseIsArguments
    : function (value) {
        return (
          isObjectLike(value) &&
          hasOwnProperty.call(value, "callee") &&
          !propertyIsEnumerable.call(value, "callee")
        );
      };
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }
  function matchesStrictComparable(key, srcValue) {
    return function (object) {
      if (object == null) {
        return false;
      }
      return (
        object[key] === srcValue &&
        (srcValue !== undefined || key in Object(object))
      );
    };
  }
  function get(object, path, defaultValue) {
    var result = object == null ? undefined : baseGet(object, path);
    return result === undefined ? defaultValue : result;
  }
  function baseIteratee(value, ...args) {
    // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
    // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
    if (typeof value == "function") {
      return value;
    }
    if (value == null) {
      return identity;
    }
    if (typeof value == "object") {
      return Array.isArray(value)
        ? baseMatchesProperty(value[0], value[1])
        : baseMatches(value);
    }
    return property(value);
  }
  function property(path) {
    return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
  }
  function baseProperty(key) {
    return function (object) {
      return object == null ? undefined : object[key];
    };
  }
  function basePropertyDeep(path) {
    return function (object) {
      return baseGet(object, path);
    };
  }
  function baseGet(object, path) {
    path = castPath(path, object);
    var index = 0,
      length = path.length;
    while (object != null && index < length) {
      object = object[toKey(path[index++])];
    }
    return index && index == length ? object : undefined;
  }
  function reduce(collection, iteratee, accumulator) {
    const initAccum = arguments.length < 3;
    return baseReduce(
      collection,
      baseIteratee(iteratee, 4),
      accumulator,
      initAccum,
      baseEach
    );
  }
  function parent(object, path) {
    return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
  }
  function baseSlice(array, start, end) {
    var index = -1,
      length = array.length;
    if (start < 0) {
      start = -start > length ? 0 : length + start;
    }
    end = end > length ? length : end;
    if (end < 0) {
      end += length;
    }
    length = start > end ? 0 : (end - start) >>> 0;
    start >>>= 0;
    var result = Array(length);
    while (++index < length) {
      result[index] = array[index + start];
    }
    return result;
  }
  function last(array) {
    var length = array == null ? 0 : array.length;
    return length ? array[length - 1] : undefined;
  }
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0:
        return func.call(thisArg);
      case 1:
        return func.call(thisArg, args[0]);
      case 2:
        return func.call(thisArg, args[0], args[1]);
      case 3:
        return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }
  function baseInvoke(object, path, args) {
    path = castPath(path, object);
    object = parent(object, path);
    var func = object == null ? object : object[toKey(last(path))];
    return func == null ? undefined : apply(func, object, args);
  }
  var defineProperty = (function () {
    try {
      var func = getNative(Object, "defineProperty");
      func({}, "", {});
      return func;
    } catch (e) {}
  })();
  function shortOut(func) {
    var count = 0,
      lastCalled = 0;
    return function () {
      var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);
      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(undefined, arguments);
    };
  }
  const baseSetToString = !defineProperty
    ? identity
    : function (func, string) {
        return defineProperty(func, "toString", {
          configurable: true,
          enumerable: false,
          value: constant(string),
          writable: true
        });
      };
  const setToString = shortOut(baseSetToString);
  function overRest(func, start, transform) {
    start = nativeMax(start === undefined ? func.length - 1 : start, 0);
    return function () {
      var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);
      while (++index < length) {
        array[index] = args[start + index];
      }
      index = -1;
      var otherArgs = Array(start + 1);
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = transform(array);
      return apply(func, this, otherArgs);
    };
  }
  function baseRest(func, start) {
    return setToString(overRest(func, start, identity), func + "");
  }
  const invoke = baseRest(baseInvoke);
  const invokeMap = baseRest(function (collection, path, args) {
    var index = -1,
      isFunc = typeof path == "function",
      result = isArrayLike(collection) ? Array(collection.length) : [];
    baseEach(collection, function (value) {
      result[++index] = isFunc
        ? apply(path, value, args)
        : baseInvoke(value, path, args);
    });
    return result;
  });
  function overArg(func, transform) {
    return function (arg) {
      return func(transform(arg));
    };
  }
  function arrayEach(array, iteratee) {
    var index = -1,
      length = array == null ? 0 : array.length;
    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }
  const baseCreate = (function () {
    function object() {}
    return function (proto) {
      if (!isObject(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object();
      object.prototype = undefined;
      return result;
    };
  })();
  function initCloneArray(array) {
    var length = array.length,
      result = new array.constructor(length);
    // Add properties assigned by `RegExp#exec`.
    if (
      length &&
      typeof array[0] == "string" &&
      hasOwnProperty.call(array, "index")
    ) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }
  function copyArray(source, array) {
    var index = -1,
      length = source.length;
    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }
  const getPrototype = overArg(Object.getPrototypeOf, Object);
  function baseAssignValue(object, key, value) {
    if (key == "__proto__" && defineProperty) {
      defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        value: value,
        writable: true
      });
    } else {
      object[key] = value;
    }
  }
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (
      !(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))
    ) {
      baseAssignValue(object, key, value);
    }
  }
  function baseTimes(n, iteratee) {
    var index = -1,
      result = Array(n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }
  function arrayLikeKeys(value, inherited) {
    var isArr = Array.isArray(value),
      isArg = !isArr && isArguments(value),
      skipIndexes = isArr || isArg,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;
    for (var key in value) {
      if (
        (inherited || hasOwnProperty.call(value, key)) &&
        !(
          skipIndexes &&
          // Safari 9 has enumerable `arguments.length` in strict mode.
          (key == "length" ||
            // Skip index properties.
            isIndex(key, length))
        )
      ) {
        result.push(key);
      }
    }
    return result;
  }
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }
  function baseKeysIn(object) {
    if (!isObject(object)) {
      return nativeKeysIn(object);
    }
    var isProto = isPrototype(object),
      result = [];
    for (var key in object) {
      if (
        !(
          key == "constructor" &&
          (isProto || !hasOwnProperty.call(object, key))
        )
      ) {
        result.push(key);
      }
    }
    return result;
  }
  function keysIn(object) {
    return isArrayLike(object)
      ? arrayLikeKeys(object, true)
      : baseKeysIn(object);
  }
  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});
    var index = -1,
      length = props.length;
    while (++index < length) {
      var key = props[index];
      var newValue = customizer
        ? customizer(object[key], source[key], key, object, source)
        : undefined;
      if (newValue === undefined) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object, key, newValue);
      } else {
        assignValue(object, key, newValue);
      }
    }
    return object;
  }
  function baseAssignIn(object, source) {
    return object && copyObject(source, keysIn(source), object);
  }
  function baseAssign(object, source) {
    return object && copyObject(source, keys(source), object);
  }
  function getAllKeysIn(object) {
    return keysIn(object);
  }
  function initCloneObject(object) {
    return typeof object.constructor == "function" && !isPrototype(object)
      ? baseCreate(getPrototype(object))
      : {};
  }
  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }
  function initCloneByTag(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case boolTag:
      case dateTag:
        return new Ctor(+object);
      case mapTag:
        return new Ctor();
      case numberTag:
      case stringTag:
        return new Ctor(object);
      case regexpTag:
        return cloneRegExp(object);
      case setTag:
        return new Ctor();
    }
  }
  function baseClone(value, bitmask, customizer, key, object, stack) {
    var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;
    if (customizer) {
      result = object
        ? customizer(value, key, object, stack)
        : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject(value)) {
      return value;
    }
    var isArr = Array.isArray(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return copyArray(value, result);
      }
    } else {
      var tag = baseGetTag(value),
        isFunc = tag == funcTag || tag == genTag;
      if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
        result = isFlat || isFunc ? {} : initCloneObject(value);
        if (!isDeep) {
          return isFlat
            ? baseAssignIn(result, value)
            : baseAssign(result, value);
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {};
        }
        result = initCloneByTag(value, tag);
      }
    }
    // Check for circular references and return its corresponding clone.
    stack || (stack = new Stack());
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);
    var keysFunc = isFull
      ? isFlat
        ? getAllKeysIn
        : getAllKeys
      : isFlat
      ? keysIn
      : keys;
    var props = isArr ? undefined : keysFunc(value);
    arrayEach(props || value, function (subValue, key) {
      if (props) {
        key = subValue;
        subValue = value[key];
      }
      // Recursively populate clone (susceptible to call stack limits).
      assignValue(
        result,
        key,
        baseClone(subValue, bitmask, customizer, key, value, stack)
      );
    });
    return result;
  }
  function clone(value) {
    return baseClone(value, CLONE_SYMBOLS_FLAG);
  }
  function cloneDeep(value) {
    return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
  }
  function baseHas(object, key) {
    return object != null && hasOwnProperty.call(object, key);
  }
  function has(object, path) {
    return object != null && hasPath(object, path, baseHas);
  }
  function hasUnicode(string) {
    return reHasUnicode.test(string);
  }
  function unicodeToArray(string) {
    return string.match(reUnicode) || [];
  }
  function asciiToArray(string) {
    return string.split("");
  }
  function stringToArray(string) {
    return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
  }
  function mapToArray(map) {
    var index = -1,
      result = Array(map.size);
    map.forEach(function (value, key) {
      result[++index] = [key, value];
    });
    return result;
  }
  function setToArray(set) {
    var index = -1,
      result = Array(set.size);
    set.forEach(function (value) {
      result[++index] = value;
    });
    return result;
  }
  function baseValues(object, props) {
    return arrayMap(props, function (key) {
      return object[key];
    });
  }
  function values(object) {
    return object == null ? [] : baseValues(object, keys(object));
  }
  /**
     *
  toArray<T>(value: List<T> | Dictionary<T> | NumericDictionary<T> | null | undefined): T[];
  toArray<T>(value: T): Array<T[keyof T]>;
  toArray(): any[];
     */
  function toArray(value) {
    if (!value) {
      return [];
    }
    if (isArrayLike(value)) {
      return isString(value) ? stringToArray(value) : copyArray(value);
    }
    var tag = baseGetTag(value),
      func = tag == mapTag ? mapToArray : tag == setTag ? setToArray : values;
    return func(value);
  }
  function flatRest(func) {
    return setToString(overRest(func, undefined, flatten), func + "");
  }
  function flatten(array) {
    var length = array == null ? 0 : array.length;
    return length ? baseFlatten(array, 1) : [];
  }
  function arrayPush(array, values) {
    var index = -1,
      length = values.length,
      offset = array.length;
    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }
  function isFlattenable(value) {
    return Array.isArray(value) || isArguments(value);
  }
  function baseFlatten(array, depth, predicate, isStrict, result) {
    var index = -1,
      length = array.length;
    predicate || (predicate = isFlattenable);
    result || (result = []);
    while (++index < length) {
      var value = array[index];
      if (depth > 0 && predicate(value)) {
        if (depth > 1) {
          // Recursively flatten arrays (susceptible to call stack limits).
          baseFlatten(value, depth - 1, predicate, isStrict, result);
        } else {
          arrayPush(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }
  function baseSet(object, path, value, customizer) {
    if (!isObject(object)) {
      return object;
    }
    path = castPath(path, object);
    var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;
    while (nested != null && ++index < length) {
      var key = toKey(path[index]),
        newValue = value;
      if (index != lastIndex) {
        var objValue = nested[key];
        newValue = customizer ? customizer(objValue, key, nested) : undefined;
        if (newValue === undefined) {
          newValue = isObject(objValue)
            ? objValue
            : isIndex(path[index + 1])
            ? []
            : {};
        }
      }
      assignValue(nested, key, newValue);
      nested = nested[key];
    }
    return object;
  }
  function basePickBy(object, paths, predicate) {
    var index = -1,
      length = paths.length,
      result = {};
    while (++index < length) {
      var path = paths[index],
        value = baseGet(object, path);
      if (predicate(value, path)) {
        baseSet(result, castPath(path, object), value);
      }
    }
    return result;
  }
  function basePick(object, paths) {
    return basePickBy(object, paths, function (value, path) {
      return hasIn(object, path);
    });
  }
  const pick = flatRest(function (object, paths) {
    return object == null ? {} : basePick(object, paths);
  });
  function baseFindKey(collection, predicate, eachFunc) {
    var result;
    eachFunc(collection, function (value, key, collection) {
      if (predicate(value, key, collection)) {
        result = key;
        return false;
      }
    });
    return result;
  }
  function findKey(object, predicate) {
    return baseFindKey(object, baseIteratee(predicate, 3), baseForOwn);
  }
  function createInverter(setter, toIteratee) {
    return function (object, iteratee) {
      return baseInverter(object, setter, toIteratee(iteratee), {});
    };
  }
  function baseInverter(object, setter, iteratee, accumulator) {
    baseForOwn(object, function (value, key, object) {
      setter(accumulator, iteratee(value), key, object);
    });
    return accumulator;
  }
  const invert = createInverter(function (result, value, key) {
    if (value != null && typeof value.toString != "function") {
      value = nativeObjectToString.call(value);
    }
    result[value] = key;
  }, constant(identity));
  function toNumber(value) {
    if (typeof value == "number") {
      return value;
    }
    if (isObject(value)) {
      var other = typeof value.valueOf == "function" ? value.valueOf() : value;
      value = isObject(other) ? other + "" : other;
    }
    if (typeof value != "string") {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, "");
    var isBinary = reIsBinary.test(value);
    return isBinary || reIsOctal.test(value)
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : reIsBadHex.test(value)
      ? NAN
      : +value;
  }
  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY || value === -INFINITY) {
      var sign = value < 0 ? -1 : 1;
      return sign * MAX_INTEGER;
    }
    return value === value ? value : 0;
  }
  function toInteger(value) {
    var result = toFinite(value),
      remainder = result % 1;
    return result === result ? (remainder ? result - remainder : result) : 0;
  }
  function dropRight(array, n, guard) {
    var length = array == null ? 0 : array.length;
    if (!length) {
      return [];
    }
    n = guard || n === undefined ? 1 : toInteger(n);
    n = length - n;
    return baseSlice(array, 0, n < 0 ? 0 : n);
  }
  function matches(source) {
    return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
  }
  var now = function () {
    return Date.now();
  };
  function debounce(func, wait, options) {
    var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;
    if (typeof func != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber(wait) || 0;
    if (isObject(options)) {
      leading = !!options.leading;
      maxing = "maxWait" in options;
      maxWait = maxing
        ? nativeMax(toNumber(options.maxWait) || 0, wait)
        : maxWait;
      trailing = "trailing" in options ? !!options.trailing : trailing;
    }
    function invokeFunc(time) {
      var args = lastArgs,
        thisArg = lastThis;
      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }
    function leadingEdge(time) {
      // Reset any `maxWait` timer.
      lastInvokeTime = time;
      // Start the timer for the trailing edge.
      timerId = setTimeout(timerExpired, wait);
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : result;
    }
    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;
      return maxing
        ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;
    }
    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;
      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (
        lastCallTime === undefined ||
        timeSinceLastCall >= wait ||
        timeSinceLastCall < 0 ||
        (maxing && timeSinceLastInvoke >= maxWait)
      );
    }
    function timerExpired() {
      var time = now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      // Restart the timer.
      timerId = setTimeout(timerExpired, remainingWait(time));
    }
    function trailingEdge(time) {
      timerId = undefined;
      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = undefined;
      return result;
    }
    function cancel() {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }
    function flush() {
      return timerId === undefined ? result : trailingEdge(now());
    }
    function debounced() {
      var time = now(),
        isInvoking = shouldInvoke(time);
      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;
      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === undefined) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }
  /**
     *
     * throttle<T extends (...args: any[]) => any>(func: T, wait?: number, options?: ThrottleSettings): T & Cancelable;

     */
  function throttle(func, wait, options) {
    var leading = true,
      trailing = true;
    if (typeof func != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    if (isObject(options)) {
      leading = "leading" in options ? !!options.leading : leading;
      trailing = "trailing" in options ? !!options.trailing : trailing;
    }
    return debounce(func, wait, {
      leading: leading,
      maxWait: wait,
      trailing: trailing
    });
  }
  function baseDelay(func, wait, args) {
    if (typeof func != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    return setTimeout(function () {
      func.apply(undefined, args);
    }, wait);
  }
  const delay = baseRest(function (func, wait, args) {
    return baseDelay(func, toNumber(wait) || 0, args);
  });
  function before(n, func) {
    var result;
    if (typeof func != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    n = toInteger(n);
    return function () {
      if (--n > 0) {
        result = func.apply(this, arguments);
      }
      if (n <= 1) {
        func = undefined;
      }
      return result;
    };
  }
  // once<T extends (...args: any[]) => any>(func: T): T;
  function once(func) {
    return before(2, func);
  }
  function baseRandom(lower, upper) {
    return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
  }
  function arrayShuffle(array) {
    return shuffleSelf(copyArray(array));
  }
  function shuffleSelf(array, size) {
    var index = -1,
      length = array.length,
      lastIndex = length - 1;
    size = size === undefined ? length : size;
    while (++index < size) {
      var rand = baseRandom(index, lastIndex),
        value = array[rand];
      array[rand] = array[index];
      array[index] = value;
    }
    array.length = size;
    return array;
  }
  function baseShuffle(collection) {
    return shuffleSelf(values(collection));
  }
  function shuffle(collection) {
    var func = Array.isArray(collection) ? arrayShuffle : baseShuffle;
    return func(collection);
  }
  function arrayAggregator(array, setter, iteratee, accumulator) {
    var index = -1,
      length = array == null ? 0 : array.length;
    while (++index < length) {
      var value = array[index];
      setter(accumulator, value, iteratee(value), array);
    }
    return accumulator;
  }
  function baseAggregator(collection, setter, iteratee, accumulator) {
    baseEach(collection, function (value, key, collection) {
      setter(accumulator, value, iteratee(value), collection);
    });
    return accumulator;
  }
  function createAggregator(setter, initializer) {
    return function (collection, iteratee) {
      var func = Array.isArray(collection) ? arrayAggregator : baseAggregator,
        accumulator = initializer ? initializer() : {};
      return func(collection, setter, baseIteratee(iteratee, 2), accumulator);
    };
  }
  const groupBy = createAggregator(function (result, value, key) {
    if (hasOwnProperty.call(result, key)) {
      result[key].push(value);
    } else {
      baseAssignValue(result, key, [value]);
    }
  });
  function castFunction(value) {
    return typeof value == "function" ? value : identity;
  }
  function each(object, iteratee) {
    return baseEach(object, castFunction(iteratee));
  }
  function isEqual(value, other) {
    return baseIsEqual(value, other);
  }
  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (
      type == "number"
        ? isArrayLike(object) && isIndex(index, object.length)
        : type == "string" && index in object
    ) {
      return eq(object[index], value);
    }
    return false;
  }
  const defaults = baseRest(function (object, sources) {
    object = Object(object);
    var index = -1;
    var length = sources.length;
    var guard = length > 2 ? sources[2] : undefined;
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      length = 1;
    }
    while (++index < length) {
      var source = sources[index];
      var props = keysIn(source);
      var propsIndex = -1;
      var propsLength = props.length;
      while (++propsIndex < propsLength) {
        var key = props[propsIndex];
        var value = object[key];
        if (
          value === undefined ||
          (eq(value, Object.prototype[key]) &&
            !hasOwnProperty.call(object, key))
        ) {
          object[key] = source[key];
        }
      }
    }
    return object;
  });
  const countBy = createAggregator(function (result, value, key) {
    if (hasOwnProperty.call(result, key)) {
      ++result[key];
    } else {
      baseAssignValue(result, key, 1);
    }
  });
  function arraySample(array) {
    var length = array.length;
    return length ? array[baseRandom(0, length - 1)] : undefined;
  }
  function baseSample(collection) {
    return arraySample(values(collection));
  }
  function sample(collection) {
    var func = Array.isArray(collection) ? arraySample : baseSample;
    return func(collection);
  }
  function baseUnary(func) {
    return function (value) {
      return func(value);
    };
  }
  function baseMap(collection, iteratee) {
    var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : [];
    baseEach(collection, function (value, key, collection) {
      result[++index] = iteratee(value, key, collection);
    });
    return result;
  }
  function baseSortBy(array, comparer) {
    var length = array.length;
    array.sort(comparer);
    while (length--) {
      array[length] = array[length].value;
    }
    return array;
  }
  function compareAscending(value, other) {
    if (value !== other) {
      var valIsDefined = value !== undefined,
        valIsNull = value === null,
        valIsReflexive = value === value;
      var othIsDefined = other !== undefined,
        othIsNull = other === null,
        othIsReflexive = other === other;
      if (
        (!othIsNull && value > other) ||
        (othIsDefined && othIsReflexive && !othIsNull) ||
        (valIsNull && othIsDefined && othIsReflexive) ||
        (!valIsDefined && othIsReflexive) ||
        !valIsReflexive
      ) {
        return 1;
      }
      if (
        (!valIsNull && value < other) ||
        (valIsDefined && valIsReflexive && !valIsNull) ||
        (othIsNull && valIsDefined && valIsReflexive) ||
        (!othIsDefined && valIsReflexive) ||
        !othIsReflexive
      ) {
        return -1;
      }
    }
    return 0;
  }
  function compareMultiple(object, other, orders) {
    var index = -1,
      objCriteria = object.criteria,
      othCriteria = other.criteria,
      length = objCriteria.length,
      ordersLength = orders.length;
    while (++index < length) {
      var result = compareAscending(objCriteria[index], othCriteria[index]);
      if (result) {
        if (index >= ordersLength) {
          return result;
        }
        var order = orders[index];
        return result * (order == "desc" ? -1 : 1);
      }
    }
    return object.index - other.index;
  }
  function baseOrderBy(collection, iteratees, orders) {
    var index = -1;
    iteratees = arrayMap(
      iteratees.length ? iteratees : [identity],
      baseUnary(baseIteratee)
    );
    var result = baseMap(collection, function (value, key, collection) {
      var criteria = arrayMap(iteratees, function (iteratee) {
        return iteratee(value);
      });
      return { criteria: criteria, index: ++index, value: value };
    });
    return baseSortBy(result, function (object, other) {
      return compareMultiple(object, other, orders);
    });
  }
  const sortBy = baseRest(function (collection, iteratees) {
    if (collection == null) {
      return [];
    }
    var length = iteratees.length;
    if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
      iteratees = [];
    } else if (
      length > 2 &&
      isIterateeCall(iteratees[0], iteratees[1], iteratees[2])
    ) {
      iteratees = [iteratees[0]];
    }
    return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
  });
  function cacheHas(cache, key) {
    return cache.has(key);
  }
  function baseIsNaN(value) {
    return value !== value;
  }
  function baseFindIndex(array, predicate, fromIndex, fromRight) {
    var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);
    while (fromRight ? index-- : ++index < length) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }
  function strictIndexOf(array, value, fromIndex) {
    var index = fromIndex - 1,
      length = array.length;
    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }
  function baseIndexOf(array, value, fromIndex) {
    return value === value
      ? strictIndexOf(array, value, fromIndex)
      : baseFindIndex(array, baseIsNaN, fromIndex);
  }
  function arrayIncludes(array, value) {
    var length = array == null ? 0 : array.length;
    return !!length && baseIndexOf(array, value, 0) > -1;
  }
  function arrayIncludesWith(array, value, comparator) {
    var index = -1,
      length = array == null ? 0 : array.length;
    while (++index < length) {
      if (comparator(value, array[index])) {
        return true;
      }
    }
    return false;
  }
  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }
  function baseDifference(array, values, iteratee, comparator) {
    var index = -1,
      includes = arrayIncludes,
      isCommon = true,
      length = array.length,
      result = [],
      valuesLength = values.length;
    if (!length) {
      return result;
    }
    if (iteratee) {
      values = arrayMap(values, baseUnary(iteratee));
    }
    if (comparator) {
      includes = arrayIncludesWith;
      isCommon = false;
    } else if (values.length >= LARGE_ARRAY_SIZE) {
      includes = cacheHas;
      isCommon = false;
      values = new SetCache(values);
    }
    outer: while (++index < length) {
      var value = array[index],
        computed = iteratee == null ? value : iteratee(value);
      value = comparator || value !== 0 ? value : 0;
      if (isCommon && computed === computed) {
        var valuesIndex = valuesLength;
        while (valuesIndex--) {
          if (values[valuesIndex] === computed) {
            continue outer;
          }
        }
        result.push(value);
      } else if (!includes(values, computed, comparator)) {
        result.push(value);
      }
    }
    return result;
  }
  const without = baseRest(function (array, values) {
    return isArrayLikeObject(array) ? baseDifference(array, values) : [];
  });
  var idCounter = 0;
  function uniqueId(prefix) {
    var id = ++idCounter;
    return toString(prefix) + id;
  }
  function noop() {
    // No operation performed.
  }
  var createSet = !(Set && 1 / setToArray(new Set([, -0]))[1] == INFINITY)
    ? noop
    : function (values) {
        return new Set(values);
      };
  function baseUniq(array, iteratee, comparator) {
    var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;
    if (comparator) {
      isCommon = false;
      includes = arrayIncludesWith;
    } else if (length >= LARGE_ARRAY_SIZE) {
      var set = iteratee ? null : createSet(array);
      if (set) {
        return setToArray(set);
      }
      isCommon = false;
      includes = cacheHas;
      seen = new SetCache();
    } else {
      seen = iteratee ? [] : result;
    }
    outer: while (++index < length) {
      var value = array[index],
        computed = iteratee ? iteratee(value) : value;
      value = comparator || value !== 0 ? value : 0;
      if (isCommon && computed === computed) {
        var seenIndex = seen.length;
        while (seenIndex--) {
          if (seen[seenIndex] === computed) {
            continue outer;
          }
        }
        if (iteratee) {
          seen.push(computed);
        }
        result.push(value);
      } else if (!includes(seen, computed, comparator)) {
        if (seen !== result) {
          seen.push(computed);
        }
        result.push(value);
      }
    }
    return result;
  }
  function uniq(array) {
    return array && array.length ? baseUniq(array) : [];
  }
  function unicodeSize(string) {
    var result = (reUnicode.lastIndex = 0);
    while (reUnicode.test(string)) {
      ++result;
    }
    return result;
  }
  const asciiSize = baseProperty("length");
  function stringSize(string) {
    return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
  }
  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty.call(object, key) && key != "constructor") {
        result.push(key);
      }
    }
    return result;
  }
  function size(collection) {
    if (collection == null) {
      return 0;
    }
    if (isArrayLike(collection)) {
      return isString(collection) ? stringSize(collection) : collection.length;
    }
    var tag = baseGetTag(collection);
    if (tag == mapTag || tag == setTag) {
      return collection.size;
    }
    return baseKeys(collection).length;
  }
  function basePropertyOf(object) {
    return function (key) {
      return object == null ? undefined : object[key];
    };
  }
  const escapeHtmlChar = basePropertyOf(htmlEscapes);
  function escape(string) {
    string = toString(string);
    return string && reHasUnescapedHtml.test(string)
      ? string.replace(reUnescapedHtml, escapeHtmlChar)
      : string;
  }
  function baseUnset(object, path) {
    path = castPath(path, object);
    object = parent(object, path);
    return object == null || delete object[toKey(last(path))];
  }
  function customOmitClone(value) {
    return isPlainObject(value) ? undefined : value;
  }
  const omit = flatRest(function (object, paths) {
    var result = {};
    if (object == null) {
      return result;
    }
    var isDeep = false;
    paths = arrayMap(paths, function (path) {
      path = castPath(path, object);
      isDeep || (isDeep = path.length > 1);
      return path;
    });
    copyObject(object, getAllKeysIn(object), result);
    if (isDeep) {
      result = baseClone(
        result,
        CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG,
        customOmitClone
      );
    }
    var length = paths.length;
    while (length--) {
      baseUnset(result, paths[length]);
    }
    return result;
  });
  return {
    // lang
    clone: clone,
    cloneDeep: cloneDeep,
    isString: isString,
    isNumber: isNumber,
    isFunction: isFunction,
    isRegExp: isRegExp,
    isEmpty: isEmpty,
    isUndefined: isUndefined,
    isNull: isNull,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isEqual: isEqual,
    toArray: toArray,
    // util
    noop: noop,
    matches: matches,
    uniqueId: uniqueId,
    // array
    uniq: uniq,
    dropRight: dropRight,
    without: without,
    // collection
    invokeMap: invokeMap,
    reduce: reduce,
    sample: sample,
    shuffle: shuffle,
    size: size,
    countBy: countBy,
    each: each,
    sortBy: sortBy,
    // object
    defaults: defaults,
    findKey: findKey,
    has: has,
    invert: invert,
    invoke: invoke,
    keys: keys,
    omit: omit,
    pick: pick,
    result: result,
    // string
    escape: escape,
    // common
    groupBy: groupBy,
    // function
    throttle: throttle,
    debounce: debounce,
    delay: delay,
    once: once
  };
})();

function createElement(tagName, options) {
  return document.createElement(tagName, options);
}
function createElementNS(namespaceURI, qualifiedName, options) {
  return document.createElementNS(namespaceURI, qualifiedName, options);
}
function createDocumentFragment() {
  return document.createDocumentFragment();
}
function createTextNode(text) {
  return document.createTextNode(text);
}
function createComment(text) {
  return document.createComment(text);
}
function insertBefore(parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}
function removeChild(node, child) {
  node.removeChild(child);
}
function appendChild(node, child) {
  node.appendChild(child);
}
function parentNode(node) {
  return node.parentNode;
}
function nextSibling(node) {
  return node.nextSibling;
}
function tagName(elm) {
  return elm.tagName;
}
function setTextContent(node, text) {
  node.textContent = text;
}
function getTextContent(node) {
  return node.textContent;
}
function isElement$2(node) {
  return node.nodeType === 1;
}
function isText(node) {
  return node.nodeType === 3;
}
function isComment(node) {
  return node.nodeType === 8;
}
function isDocumentFragment$1(node) {
  return node.nodeType === 11;
}
const htmlDomApi = {
  createElement,
  createElementNS,
  createTextNode,
  createDocumentFragment,
  createComment,
  insertBefore,
  removeChild,
  appendChild,
  parentNode,
  nextSibling,
  tagName,
  setTextContent,
  getTextContent,
  isElement: isElement$2,
  isText,
  isComment,
  isDocumentFragment: isDocumentFragment$1
};

function vnode(sel, data, children, text, elm) {
  const key = data === undefined ? undefined : data.key;
  return { sel, data, children, text, elm, key };
}

const array = Array.isArray;
function primitive(s) {
  return (
    typeof s === "string" ||
    typeof s === "number" ||
    s instanceof String ||
    s instanceof Number
  );
}

function isUndef(s) {
  return s === undefined;
}
function isDef(s) {
  return s !== undefined;
}
const emptyNode = vnode("", {}, [], undefined, undefined);
function sameVnode(vnode1, vnode2) {
  var _a, _b;
  const isSameKey = vnode1.key === vnode2.key;
  const isSameIs =
    ((_a = vnode1.data) === null || _a === void 0 ? void 0 : _a.is) ===
    ((_b = vnode2.data) === null || _b === void 0 ? void 0 : _b.is);
  const isSameSel = vnode1.sel === vnode2.sel;
  return isSameSel && isSameKey && isSameIs;
}
/**
 * @todo Remove this function when the document fragment is considered stable.
 */
function documentFragmentIsNotSupported() {
  throw new Error("The document fragment is not supported on this platform.");
}
function isElement$1(api, vnode) {
  return api.isElement(vnode);
}
function isDocumentFragment(api, vnode) {
  return api.isDocumentFragment(vnode);
}
function createKeyToOldIdx(children, beginIdx, endIdx) {
  var _a;
  const map = {};
  for (let i = beginIdx; i <= endIdx; ++i) {
    const key = (_a = children[i]) === null || _a === void 0 ? void 0 : _a.key;
    if (key !== undefined) {
      map[key] = i;
    }
  }
  return map;
}
const hooks = ["create", "update", "remove", "destroy", "pre", "post"];
function init(modules, domApi, options) {
  const cbs = {
    create: [],
    update: [],
    remove: [],
    destroy: [],
    pre: [],
    post: []
  };
  const api = domApi !== undefined ? domApi : htmlDomApi;
  for (const hook of hooks) {
    for (const module of modules) {
      const currentHook = module[hook];
      if (currentHook !== undefined) {
        cbs[hook].push(currentHook);
      }
    }
  }
  function emptyNodeAt(elm) {
    const id = elm.id ? "#" + elm.id : "";
    // elm.className doesn't return a string when elm is an SVG element inside a shadowRoot.
    // https://stackoverflow.com/questions/29454340/detecting-classname-of-svganimatedstring
    const classes = elm.getAttribute("class");
    const c = classes ? "." + classes.split(" ").join(".") : "";
    return vnode(
      api.tagName(elm).toLowerCase() + id + c,
      {},
      [],
      undefined,
      elm
    );
  }
  function emptyDocumentFragmentAt(frag) {
    return vnode(undefined, {}, [], undefined, frag);
  }
  function createRmCb(childElm, listeners) {
    return function rmCb() {
      if (--listeners === 0) {
        const parent = api.parentNode(childElm);
        api.removeChild(parent, childElm);
      }
    };
  }
  function createElm(vnode, insertedVnodeQueue) {
    var _a, _b, _c, _d;
    let i;
    let data = vnode.data;
    if (data !== undefined) {
      const init =
        (_a = data.hook) === null || _a === void 0 ? void 0 : _a.init;
      if (isDef(init)) {
        init(vnode);
        data = vnode.data;
      }
    }
    const children = vnode.children;
    const sel = vnode.sel;
    if (sel === "!") {
      if (isUndef(vnode.text)) {
        vnode.text = "";
      }
      vnode.elm = api.createComment(vnode.text);
    } else if (sel !== undefined) {
      // Parse selector
      const hashIdx = sel.indexOf("#");
      const dotIdx = sel.indexOf(".", hashIdx);
      const hash = hashIdx > 0 ? hashIdx : sel.length;
      const dot = dotIdx > 0 ? dotIdx : sel.length;
      const tag =
        hashIdx !== -1 || dotIdx !== -1
          ? sel.slice(0, Math.min(hash, dot))
          : sel;
      const elm = (vnode.elm =
        isDef(data) && isDef((i = data.ns))
          ? api.createElementNS(i, tag, data)
          : api.createElement(tag, data));
      if (hash < dot) elm.setAttribute("id", sel.slice(hash + 1, dot));
      if (dotIdx > 0)
        elm.setAttribute("class", sel.slice(dot + 1).replace(/\./g, " "));
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);
      if (array(children)) {
        for (i = 0; i < children.length; ++i) {
          const ch = children[i];
          if (ch != null) {
            api.appendChild(elm, createElm(ch, insertedVnodeQueue));
          }
        }
      } else if (primitive(vnode.text)) {
        api.appendChild(elm, api.createTextNode(vnode.text));
      }
      const hook = vnode.data.hook;
      if (isDef(hook)) {
        (_b = hook.create) === null || _b === void 0
          ? void 0
          : _b.call(hook, emptyNode, vnode);
        if (hook.insert) {
          insertedVnodeQueue.push(vnode);
        }
      }
    } else if (
      ((_c =
        options === null || options === void 0
          ? void 0
          : options.experimental) === null || _c === void 0
        ? void 0
        : _c.fragments) &&
      vnode.children
    ) {
      const children = vnode.children;
      vnode.elm = (
        (_d = api.createDocumentFragment) !== null && _d !== void 0
          ? _d
          : documentFragmentIsNotSupported
      )();
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);
      for (i = 0; i < children.length; ++i) {
        const ch = children[i];
        if (ch != null) {
          api.appendChild(vnode.elm, createElm(ch, insertedVnodeQueue));
        }
      }
    } else {
      vnode.elm = api.createTextNode(vnode.text);
    }
    return vnode.elm;
  }
  function addVnodes(
    parentElm,
    before,
    vnodes,
    startIdx,
    endIdx,
    insertedVnodeQueue
  ) {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx];
      if (ch != null) {
        api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
      }
    }
  }
  function invokeDestroyHook(vnode) {
    var _a, _b;
    const data = vnode.data;
    if (data !== undefined) {
      (_b =
        (_a = data === null || data === void 0 ? void 0 : data.hook) === null ||
        _a === void 0
          ? void 0
          : _a.destroy) === null || _b === void 0
        ? void 0
        : _b.call(_a, vnode);
      for (let i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode);
      if (vnode.children !== undefined) {
        for (let j = 0; j < vnode.children.length; ++j) {
          const child = vnode.children[j];
          if (child != null && typeof child !== "string") {
            invokeDestroyHook(child);
          }
        }
      }
    }
  }
  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    var _a, _b;
    for (; startIdx <= endIdx; ++startIdx) {
      let listeners;
      let rm;
      const ch = vnodes[startIdx];
      if (ch != null) {
        if (isDef(ch.sel)) {
          invokeDestroyHook(ch);
          listeners = cbs.remove.length + 1;
          rm = createRmCb(ch.elm, listeners);
          for (let i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm);
          const removeHook =
            (_b =
              (_a = ch === null || ch === void 0 ? void 0 : ch.data) === null ||
              _a === void 0
                ? void 0
                : _a.hook) === null || _b === void 0
              ? void 0
              : _b.remove;
          if (isDef(removeHook)) {
            removeHook(ch, rm);
          } else {
            rm();
          }
        } else {
          // Text node
          api.removeChild(parentElm, ch.elm);
        }
      }
    }
  }
  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
    let oldStartIdx = 0;
    let newStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let oldStartVnode = oldCh[0];
    let oldEndVnode = oldCh[oldEndIdx];
    let newEndIdx = newCh.length - 1;
    let newStartVnode = newCh[0];
    let newEndVnode = newCh[newEndIdx];
    let oldKeyToIdx;
    let idxInOld;
    let elmToMove;
    let before;
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (oldStartVnode == null) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
      } else if (oldEndVnode == null) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (newStartVnode == null) {
        newStartVnode = newCh[++newStartIdx];
      } else if (newEndVnode == null) {
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        api.insertBefore(
          parentElm,
          oldStartVnode.elm,
          api.nextSibling(oldEndVnode.elm)
        );
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (oldKeyToIdx === undefined) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        }
        idxInOld = oldKeyToIdx[newStartVnode.key];
        if (isUndef(idxInOld)) {
          // New element
          api.insertBefore(
            parentElm,
            createElm(newStartVnode, insertedVnodeQueue),
            oldStartVnode.elm
          );
        } else {
          elmToMove = oldCh[idxInOld];
          if (elmToMove.sel !== newStartVnode.sel) {
            api.insertBefore(
              parentElm,
              createElm(newStartVnode, insertedVnodeQueue),
              oldStartVnode.elm
            );
          } else {
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
            oldCh[idxInOld] = undefined;
            api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
          }
        }
        newStartVnode = newCh[++newStartIdx];
      }
    }
    if (newStartIdx <= newEndIdx) {
      before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
      addVnodes(
        parentElm,
        before,
        newCh,
        newStartIdx,
        newEndIdx,
        insertedVnodeQueue
      );
    }
    if (oldStartIdx <= oldEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }
  function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
    var _a, _b, _c, _d, _e;
    const hook = (_a = vnode.data) === null || _a === void 0 ? void 0 : _a.hook;
    (_b = hook === null || hook === void 0 ? void 0 : hook.prepatch) === null ||
    _b === void 0
      ? void 0
      : _b.call(hook, oldVnode, vnode);
    const elm = (vnode.elm = oldVnode.elm);
    const oldCh = oldVnode.children;
    const ch = vnode.children;
    if (oldVnode === vnode) return;
    if (vnode.data !== undefined) {
      for (let i = 0; i < cbs.update.length; ++i)
        cbs.update[i](oldVnode, vnode);
      (_d =
        (_c = vnode.data.hook) === null || _c === void 0
          ? void 0
          : _c.update) === null || _d === void 0
        ? void 0
        : _d.call(_c, oldVnode, vnode);
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue);
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) api.setTextContent(elm, "");
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        api.setTextContent(elm, "");
      }
    } else if (oldVnode.text !== vnode.text) {
      if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      }
      api.setTextContent(elm, vnode.text);
    }
    (_e = hook === null || hook === void 0 ? void 0 : hook.postpatch) ===
      null || _e === void 0
      ? void 0
      : _e.call(hook, oldVnode, vnode);
  }
  return function patch(oldVnode, vnode) {
    let i, elm, parent;
    const insertedVnodeQueue = [];
    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]();
    if (isElement$1(api, oldVnode)) {
      oldVnode = emptyNodeAt(oldVnode);
    } else if (isDocumentFragment(api, oldVnode)) {
      oldVnode = emptyDocumentFragmentAt(oldVnode);
    }
    if (sameVnode(oldVnode, vnode)) {
      patchVnode(oldVnode, vnode, insertedVnodeQueue);
    } else {
      elm = oldVnode.elm;
      parent = api.parentNode(elm);
      createElm(vnode, insertedVnodeQueue);
      if (parent !== null) {
        api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
        removeVnodes(parent, [oldVnode], 0, 0);
      }
    }
    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
    }
    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]();
    return vnode;
  };
}

function addNS(data, children, sel) {
  data.ns = "http://www.w3.org/2000/svg";
  if (sel !== "foreignObject" && children !== undefined) {
    for (let i = 0; i < children.length; ++i) {
      const child = children[i];
      if (typeof child === "string") continue;
      const childData = child.data;
      if (childData !== undefined) {
        addNS(childData, child.children, child.sel);
      }
    }
  }
}
function h(sel, b, c) {
  let data = {};
  let children;
  let text;
  let i;
  if (c !== undefined) {
    if (b !== null) {
      data = b;
    }
    if (array(c)) {
      children = c;
    } else if (primitive(c)) {
      text = c.toString();
    } else if (c && c.sel) {
      children = [c];
    }
  } else if (b !== undefined && b !== null) {
    if (array(b)) {
      children = b;
    } else if (primitive(b)) {
      text = b.toString();
    } else if (b && b.sel) {
      children = [b];
    } else {
      data = b;
    }
  }
  if (children !== undefined) {
    for (i = 0; i < children.length; ++i) {
      if (primitive(children[i]))
        children[i] = vnode(
          undefined,
          undefined,
          undefined,
          children[i],
          undefined
        );
    }
  }
  if (
    sel[0] === "s" &&
    sel[1] === "v" &&
    sel[2] === "g" &&
    (sel.length === 3 || sel[3] === "." || sel[3] === "#")
  ) {
    addNS(data, children, sel);
  }
  return vnode(sel, data, children, text, undefined);
}

function toVNode(node, domApi) {
  const api = domApi !== undefined ? domApi : htmlDomApi;
  let text;
  if (api.isElement(node)) {
    const id = node.id ? "#" + node.id : "";
    const cn = node.getAttribute("class");
    const c = cn ? "." + cn.split(" ").join(".") : "";
    const sel = api.tagName(node).toLowerCase() + id + c;
    const attrs = {};
    const datasets = {};
    const data = {};
    const children = [];
    let name;
    let i, n;
    const elmAttrs = node.attributes;
    const elmChildren = node.childNodes;
    for (i = 0, n = elmAttrs.length; i < n; i++) {
      name = elmAttrs[i].nodeName;
      if (
        name[0] === "d" &&
        name[1] === "a" &&
        name[2] === "t" &&
        name[3] === "a" &&
        name[4] === "-"
      ) {
        datasets[name.slice(5)] = elmAttrs[i].nodeValue || "";
      } else if (name !== "id" && name !== "class") {
        attrs[name] = elmAttrs[i].nodeValue;
      }
    }
    for (i = 0, n = elmChildren.length; i < n; i++) {
      children.push(toVNode(elmChildren[i], domApi));
    }
    if (Object.keys(attrs).length > 0) data.attrs = attrs;
    if (Object.keys(datasets).length > 0) data.datasets = datasets;
    if (
      sel[0] === "s" &&
      sel[1] === "v" &&
      sel[2] === "g" &&
      (sel.length === 3 || sel[3] === "." || sel[3] === "#")
    ) {
      addNS(data, children, sel);
    }
    return vnode(sel, data, children, undefined, node);
  } else if (api.isText(node)) {
    text = api.getTextContent(node);
    return vnode(undefined, undefined, undefined, text, node);
  } else if (api.isComment(node)) {
    text = api.getTextContent(node);
    return vnode("!", {}, [], text, node);
  } else {
    return vnode("", {}, [], undefined, node);
  }
}

const xlinkNS = "http://www.w3.org/1999/xlink";
const xmlNS = "http://www.w3.org/XML/1998/namespace";
const colonChar = 58;
const xChar = 120;
function updateAttrs(oldVnode, vnode) {
  let key;
  const elm = vnode.elm;
  let oldAttrs = oldVnode.data.attrs;
  let attrs = vnode.data.attrs;
  if (!oldAttrs && !attrs) return;
  if (oldAttrs === attrs) return;
  oldAttrs = oldAttrs || {};
  attrs = attrs || {};
  // update modified attributes, add new attributes
  for (key in attrs) {
    const cur = attrs[key];
    const old = oldAttrs[key];
    if (old !== cur) {
      if (cur === true) {
        elm.setAttribute(key, "");
      } else if (cur === false) {
        elm.removeAttribute(key);
      } else {
        if (key.charCodeAt(0) !== xChar) {
          elm.setAttribute(key, cur);
        } else if (key.charCodeAt(3) === colonChar) {
          // Assume xml namespace
          elm.setAttributeNS(xmlNS, key, cur);
        } else if (key.charCodeAt(5) === colonChar) {
          // Assume xlink namespace
          elm.setAttributeNS(xlinkNS, key, cur);
        } else {
          elm.setAttribute(key, cur);
        }
      }
    }
  }
  // remove removed attributes
  // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
  // the other option is to remove all attributes with value == undefined
  for (key in oldAttrs) {
    if (!(key in attrs)) {
      elm.removeAttribute(key);
    }
  }
}
const attributesModule = {
  create: updateAttrs,
  update: updateAttrs
};

var VDom;
(function (VDom) {
  const flatten = function (arr) {
    return Array.prototype.concat.apply([], arr);
  };
  class DomWidget {
    constructor(node) {
      this.type = "Widget";
      this.node = node;
    }
    init() {
      return loadScript(this.node.cloneNode(true));
    }
    update(previous, domNode) {
      if (
        "domNodeWidget" === previous.constructor.widgetType &&
        domNode.nodeType === this.node.nodeType
      ) {
        switch (domNode.nodeType) {
          case 3:
            domNode.textContent = this.node.textContent;
            return domNode;
          case 1:
            domNode.outerHTML = this.node.outerHTML;
            return domNode;
        }
      }
      return this.init();
    }
  }
  DomWidget.widgetType = "domNodeWidget";
  function loadScript(domNode) {
    if (!domNode.querySelectorAll) {
      return domNode;
    }
    if (domNode.tagName === "SCRIPT") {
      return replaceScript(domNode);
    }
    Array.prototype.slice
      .call(domNode.querySelectorAll("script"))
      .forEach(function (script) {
        var newScript = replaceScript(script);
        if (newScript !== script) {
          script.parentNode.insertBefore(newScript, script);
          script.parentNode.removeChild(script);
        }
      });
    return domNode;
  }
  function replaceScript(script) {
    if (script.type && "text/javascript" !== script.type) {
      return script;
    }
    const newScript = document.createElement("script");
    newScript.type = "text/javascript";
    if (script.src) {
      // Note: scripts will be loaded asynchronously (not in order)
      newScript.src = script.src;
    } else {
      newScript.textContent = script.textContent;
    }
    return newScript;
  }
  function makeHtmlNode(html) {
    if (!_.isString(html)) {
      return html;
    }
    const div = document.createElement("div");
    div.innerHTML = html;
    return Array.prototype.slice.call(div.childNodes).map((child) => {
      return toVNode(new DomWidget(child).node);
    });
  }
  VDom.makeHtmlNode = makeHtmlNode;
  function compileAttributes(attributes, attributeBlocks) {
    var attrsObj = attributeBlocks.reduce(
      function (finalObj, currObj) {
        for (var propName in currObj) {
          finalObj[propName] = finalObj[propName]
            ? finalObj[propName].concat(currObj[propName])
            : [currObj[propName]];
        }
        return finalObj;
      },
      attributes.reduce(function (finalObj, attr) {
        var val = attr.val;
        finalObj[attr.name] = finalObj[attr.name]
          ? finalObj[attr.name].concat(val)
          : [val];
        return finalObj;
      }, {})
    );
    for (var propName in attrsObj) {
      if (propName === "class") {
        attrsObj[propName] = flatten(
          attrsObj[propName].map(function (attrValue) {
            if (
              attrValue &&
              typeof attrValue === "object" &&
              !Array.isArray(attrValue)
            ) {
              var classResult = [];
              for (var className in attrValue) {
                if (attrValue[className]) {
                  classResult.push(className);
                }
              }
              return classResult;
            }
            return attrValue;
          })
        ).join(" ");
      } else {
        attrsObj[propName] = attrsObj[propName].pop();
      }
    }
    return attrsObj;
  }
  VDom.compileAttributes = compileAttributes;
  function text(str) {
    if (_.isString(str)) {
      return str.replace("&nbsp;", "\u00A0");
    }
    return str;
  }
  VDom.text = text;
  VDom.patch = init([
    attributesModule
    // Snabbdom.eventListenersModule,
    // Snabbdom.classModule,
    // Snabbdom.propsModule,
    // Snabbdom.styleModule,
    // Snabbdom.datasetModule
  ]);
  VDom.h = h;
  VDom.vnode = vnode;
  VDom.toVNode = toVNode;
  // Performant method for returning the $dom instance
  function _getEl(el) {
    return $dom.is$Dom(el) ? el : $dom(el);
  }
  VDom.DomApi = Object.assign({}, htmlDomApi, {
    createBuffer() {
      return document.createDocumentFragment();
    },
    // Lookup the `selector` string
    // Selector may also be a DOM element
    // Returns an array-like object of nodes
    getEl(selector) {
      return _getEl(selector);
    },
    // Finds the `selector` string with the el
    // Returns an array-like object of nodes
    findEl(el, selector, _$el = _getEl(el)) {
      return _$el.find(selector);
    },
    // Returns true if the el contains the node childEl
    hasEl(el, childEl) {
      return el.contains(childEl && childEl.parentNode);
    },
    // Detach `el` from the DOM without removing listeners
    detachEl(el, _$el = _getEl(el)) {
      _$el.detach();
    },
    // Remove `oldEl` from the DOM and put `newEl` in its place
    replaceEl(newEl, oldEl) {
      if (newEl === oldEl) {
        return;
      }
      const parent = oldEl.parentNode;
      if (!parent) {
        return;
      }
      parent.replaceChild(newEl, oldEl);
    },
    // Swaps the location of `el1` and `el2` in the DOM
    swapEl(el1, el2) {
      if (el1 === el2) {
        return;
      }
      const parent1 = el1.parentNode;
      const parent2 = el2.parentNode;
      if (!parent1 || !parent2) {
        return;
      }
      const next1 = el1.nextSibling;
      const next2 = el2.nextSibling;
      parent1.insertBefore(el2, next1);
      parent2.insertBefore(el1, next2);
    },
    // Replace the contents of `el` with the HTML string of `html`
    setContents(el, html, _$el = _getEl(el)) {
      _$el.html(html);
    },
    // Takes the DOM node `el` and appends the DOM node `contents`
    // to the end of the element's contents.
    appendContents(
      el,
      contents,
      { _$el = _getEl(el), _$contents = _getEl(contents) } = {}
    ) {
      _$el.append(_$contents);
    },
    // Does the el have child nodes
    hasContents(el) {
      return !!el && el.hasChildNodes();
    },
    // Remove the inner contents of `el` from the DOM while leaving
    // `el` itself in the DOM.
    detachContents(el, _$el = _getEl(el)) {
      _$el.contents().detach();
    }
  });
  VDom.setDomApi = function setDomApi(mixin) {
    this.prototype.Dom = Object.assign({}, this.prototype.Dom, mixin);
    return this;
  };
})(VDom || (VDom = {}));

const $doc = document;
const $win = window;
const $docEle = $doc.documentElement;
// export const $createElement = $doc.createElement.bind($doc);
const $div = VDom.DomApi.createElement("div");
const $table = VDom.DomApi.createElement("table");
const $tbody = VDom.DomApi.createElement("tbody");
const $tr = VDom.DomApi.createElement("tr");
const $idRe = /^#(?:[\w-]|\\.|[^\x00-\xa0])*$/;
const classRe = /^\.(?:[\w-]|\\.|[^\x00-\xa0])*$/;
const htmlRe = /<.+>/;
const tagRe = /^\w+$/;
const fragmentRe = /^\s*<(\w+)[^>]*>/;
const singleTagRe = /^\s*<(\w+)\s*\/?>(?:<\/\1>)?\s*$/;
const HTMLCDATARe = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
const scriptAttributes = ["type", "src", "nonce", "noModule"];

const scriptTypeRe = /^$|^module$|\/(java|ecma)script/i;
function isScriptElement(x) {
  return scriptTypeRe.test(x.type);
}
function isHtmlFormElement(el) {
  return "FORM" === el.tagName;
}
function isWindow(x) {
  return !!x && x === x.window;
}
function isDocument(x) {
  return !!x && x.nodeType === 9;
}
function isElement(x) {
  return !!x && x.nodeType === 1;
}

function $find(selector, context = $doc) {
  return !isDocument(context) && !isElement(context)
    ? []
    : classRe.test(selector)
    ? context.getElementsByClassName(selector.slice(1))
    : tagRe.test(selector)
    ? context.getElementsByTagName(selector)
    : context.querySelectorAll(selector);
}

const $splitValuesRe = /\S+/g;
function $getSplitValues(str) {
  return _.isString(str) ? str.match($splitValuesRe) || [] : [];
}

const dashAlphaRe = /-([a-z])/g;
function $camelCase(str) {
  return str.replace(dashAlphaRe, (match, letter) => letter.toUpperCase());
}

function $unique(arr) {
  return arr.length > 1
    ? Array.prototype.filter.call(
        arr,
        (item, index, self) =>
          Array.prototype.indexOf.call(self, item) === index
      )
    : arr;
}

function $each(arr, callback, reverse) {
  if (reverse) {
    let i = arr.length;
    while (i--) {
      if (callback.call(arr[i], i, arr[i]) === false) {
        return arr;
      }
    }
  } else {
    for (let i = 0, l = arr.length; i < l; i++) {
      if (callback.call(arr[i], i, arr[i]) === false) return arr;
    }
  }
  return arr;
}

function $matches(ele, selector) {
  const matches =
    ele &&
    (ele["matches"] ||
      ele["webkitMatchesSelector"] ||
      ele["msMatchesSelector"]);
  return !!matches && matches.call(ele, selector);
}

function $attr(attr, value) {
  if (!attr) return;
  if (_.isString(attr)) {
    if (arguments.length < 2) {
      if (!this[0]) return;
      const value = this[0].getAttribute(attr);
      return _.isNull(value) ? undefined : value;
    }
    if (_.isUndefined(value)) return this;
    if (_.isNull(value)) return this.removeAttr(attr);
    return this.each((i, ele) => {
      ele.setAttribute(attr, value);
    });
  }
  for (const key in attr) {
    this.attr(key, attr[key]);
  }
  return this;
}

const $queryEncodeSpaceRe = /%20/g;
function $queryEncode(prop, value) {
  return `&${encodeURIComponent(prop)}=${encodeURIComponent(value).replace(
    $queryEncodeSpaceRe,
    "+"
  )}`;
}

const $cssVariableRe = /^--/;
function $isCSSVariable(prop) {
  return $cssVariableRe.test(prop);
}

const $numericProps = {
  animationIterationCount: true,
  columnCount: true,
  flexGrow: true,
  flexShrink: true,
  fontWeight: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  widows: true,
  zIndex: true
};
function $getSuffixedValue(prop, value, isVariable = $isCSSVariable(prop)) {
  if (_.isString(value) || (_.isString(value) && isVariable)) {
    return value;
  } else if ($numericProps[prop]) {
    return value.toString();
  } else {
    return `${value}px`;
  }
}

const $prefixedProps = {},
  { style } = $div,
  vendorsPrefixes = ["webkit", "moz", "ms"];
function $getPrefixedProp(prop, isVariable = $isCSSVariable(prop)) {
  if (isVariable) return prop;
  if (!$prefixedProps[prop]) {
    const propCC = $camelCase(prop),
      propUC = `${propCC[0].toUpperCase()}${propCC.slice(1)}`,
      props = `${propCC} ${vendorsPrefixes.join(`${propUC} `)}${propUC}`.split(
        " "
      );
    $each(props, (i, p) => {
      if (p in style) {
        $prefixedProps[prop] = p;
        return false;
      }
    });
  }
  return $prefixedProps[prop];
}
const $DomStaticPrefixedPropMixin = {
  prefixedProp: $getPrefixedProp
};

function $computeStyle(ele, prop, isVariable) {
  if (!isElement(ele) || !prop) return;
  const style = $win.getComputedStyle(ele, null);
  return prop
    ? isVariable
      ? style.getPropertyValue(prop) || undefined
      : style[prop]
    : style;
}

function $computeStyleInt(ele, prop) {
  const computedStyle = $computeStyle(ele, prop);
  return parseInt(computedStyle, 10) || 0;
}

function $getExtraSpace(ele, xAxis) {
  return (
    $computeStyleInt(ele, `border${xAxis ? "Left" : "Top"}Width`) +
    $computeStyleInt(ele, `padding${xAxis ? "Left" : "Top"}`) +
    $computeStyleInt(ele, `padding${xAxis ? "Right" : "Bottom"}`) +
    $computeStyleInt(ele, `border${xAxis ? "Right" : "Bottom"}Width`)
  );
}

function $css(prop, value) {
  if (_.isString(prop)) {
    const isVariable = $isCSSVariable(prop);
    prop = $getPrefixedProp(prop, isVariable);
    if (arguments.length < 2)
      return this[0] && $computeStyle(this[0], prop, isVariable);
    if (!prop) return this;
    value = $getSuffixedValue(prop, value, isVariable);
    return this.each((i, ele) => {
      if (!isElement(ele)) return;
      if (isVariable) {
        ele.style.setProperty(prop, value.toString());
      } else {
        ele.style[prop] = value;
      }
    });
  }
  for (const key in prop) {
    this.css(key, prop[key]);
  }
  return this;
}
Object.assign({}, $DomStaticPrefixedPropMixin);

const $eventsNamespace = "___ce";
const $eventsNamespacesSeparator = ".";
const $eventsFocus = {
  focus: "focusin",
  blur: "focusout"
};
const $eventsHover = {
  mouseenter: "mouseover",
  mouseleave: "mouseout"
};
const $eventsMouseRe = /^(mouse|pointer|contextmenu|drag|drop|click|dblclick)/i;

function $getEventNameBubbling(name) {
  return $eventsHover[name] || $eventsFocus[name] || name;
}

function $getEventsCache(ele) {
  return (ele[$eventsNamespace] = ele[$eventsNamespace] || {});
}

function $hasNamespaces(ns1, ns2) {
  return !ns2 || !Array.prototype.some.call(ns2, (ns) => ns1.indexOf(ns) < 0);
}

function $removeEvent(ele, name, namespaces, selector, callback) {
  const cache = $getEventsCache(ele);
  if (!name) {
    for (name in cache) {
      $removeEvent(ele, name, namespaces, selector, callback);
    }
  } else if (cache[name]) {
    cache[name] = cache[name].filter(([ns, sel, cb]) => {
      if (
        (callback && cb.guid !== callback.guid) ||
        !$hasNamespaces(ns, namespaces) ||
        (selector && selector !== sel)
      )
        return true;
      ele.removeEventListener(name, cb);
    });
  }
}

function $parseEventName(eventName) {
  const parts = eventName.split($eventsNamespacesSeparator);
  return [parts[0], parts.slice(1).sort()]; // [name, namespace[]]
}

function $html(html) {
  if (_.isUndefined(html)) {
    return this[0] && this[0].innerHTML;
  }
  return this.each((i, ele) => {
    ele.innerHTML = html;
  });
}

function $text(text) {
  if (_.isUndefined(text)) {
    return this[0] ? this[0].textContent : "";
  }
  return this.each((i, ele) => {
    ele.textContent = text;
  });
}

function is$Dom(x) {
  return x instanceof $Dom;
}
function $getCompareFunction(comparator) {
  return _.isString(comparator)
    ? (i, ele) => $matches(ele, comparator)
    : _.isFunction(comparator)
    ? comparator
    : is$Dom(comparator)
    ? (i, ele) => comparator.is(ele)
    : !comparator
    ? () => false
    : (i, ele) => ele === comparator;
}
function $extend(target, ...objs) {
  const l = arguments.length;
  if (!l) {
    return {};
  }
  if (1 === l) {
    return $extend($Dom, target);
  }
  for (let i = 1; i < l; i += 1) {
    for (const key in arguments[i]) {
      target[key] = arguments[i][key];
    }
  }
  return target;
}
const $containers = {
  "*": $div,
  tr: $tbody,
  td: $tr,
  th: $tr,
  thead: $table,
  tbody: $table,
  tfoot: $table
};
function $parseHTML(html) {
  if (!_.isString(html)) return [];
  if (singleTagRe.test(html)) return [VDom.DomApi.createElement(RegExp.$1)];
  const fragment = fragmentRe.test(html) && RegExp.$1,
    container = $containers[fragment] || $containers["*"];
  container.innerHTML = html;
  return $Dom.prototype.init(container.childNodes).detach().get();
}
function $evalScripts(node, doc) {
  const collection = $dom(node);
  collection
    .filter("script")
    .add(collection.find("script"))
    .each((i, ele) => {
      if (isScriptElement(ele) && $docEle.contains(ele)) {
        // The script type is supported // The element is attached to the DOM // Using `documentElement` for broader browser support
        const script = VDom.DomApi.createElement("script");
        script.text = ele.textContent.replace(HTMLCDATARe, "");
        $each(scriptAttributes, (i, attr) => {
          if (ele[attr]) {
            script[attr] = ele[attr];
          }
        });
        doc.head.insertBefore(script, null);
        doc.head.removeChild(script);
      }
    });
}
function $insertElement(anchor, target, left, inside) {
  if (inside) {
    // prepend/append
    anchor.insertBefore(target, left ? anchor.firstElementChild : null);
  } else {
    // before/after
    anchor.parentNode.insertBefore(
      target,
      left ? anchor : anchor.nextElementSibling
    );
  }
  $evalScripts(target, anchor.ownerDocument);
}
function $getScript(url, success) {
  const script = VDom.DomApi.createElement("script"),
    $anchor = $dom("script");
  script.async = true;
  script.src = url;
  if (success)
    script.onload = () => {
      success();
    };
  $anchor.before(script);
}
function $insertSelectors(selectors, anchors, params) {
  $each(
    // walk arguments of $dom(query).operation(selector) ArrayLike<Selector>
    selectors,
    (selectorIndex, selector) => {
      $each(
        // walk $dom(arguments[i]) => selector
        $dom(selector),
        (targetIndex, target) => {
          $each(
            // walk $dom(this)
            $dom(anchors),
            (anchorIndex, anchor) => {
              const anchorFinal = params.inverse ? target : anchor,
                targetFinal = params.inverse ? anchor : target;
              $insertElement(
                anchorFinal,
                !anchorIndex ? targetFinal : targetFinal.cloneNode(true),
                params.left,
                params.inside
              );
            },
            params.reverseLoop3
          );
        },
        params.reverseLoop2
      );
    },
    params.reverseLoopSelectorsArgs
  );
  return anchors;
}
function $getStyleSize(value) {
  // get a number from a string, not a percentage
  const num = parseFloat(value);
  // not a percent like '100%', and a number
  const isValid = value.indexOf("%") == -1 && !isNaN(num);
  return isValid && num;
}
const $getSize = (function () {
  // -------------------------- measurements -------------------------- //
  const measurements = [
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "paddingBottom",
    "marginLeft",
    "marginRight",
    "marginTop",
    "marginBottom",
    "borderLeftWidth",
    "borderRightWidth",
    "borderTopWidth",
    "borderBottomWidth"
  ];
  const measurementsLength = measurements.length;
  function getZeroSize() {
    const size = {
      width: 0,
      height: 0,
      innerWidth: 0,
      innerHeight: 0,
      outerWidth: 0,
      outerHeight: 0
    };
    for (var i = 0; i < measurementsLength; i++) {
      var measurement = measurements[i];
      size[measurement] = 0;
    }
    return size;
  }
  // -------------------------- getStyle -------------------------- //
  /**
   * getStyle, get style of element, check for Firefox bug
   * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
   */
  function getStyle(elem) {
    var style = getComputedStyle(elem);
    if (!style) {
      console.error(
        `Style returned ${style}. Are you running this code in a hidden iframe on Firefox? See https://bit.ly/getsizebug1`
      );
    }
    return style;
  }
  // -------------------------- setup -------------------------- //
  let isSetup = false;
  let isBoxSizeOuter;
  /**
   * setup
   * check isBoxSizerOuter
   * do on first getSize() rather than on page load for Firefox bug
   */
  function setup() {
    // setup once
    if (isSetup) {
      return;
    }
    isSetup = true;
    // -------------------------- box sizing -------------------------- //
    /**
     * Chrome & Safari measure the outer-width on style.width on border-box elems
     * IE11 & Firefox<29 measures the inner-width
     */
    const div = VDom.DomApi.createElement("div");
    div.style.width = "200px";
    div.style.padding = "1px 2px 3px 4px";
    div.style.borderStyle = "solid";
    div.style.borderWidth = "1px 2px 3px 4px";
    div.style.boxSizing = "border-box";
    var body = $doc.body || $docEle;
    body.appendChild(div);
    var style = $computeStyle(div);
    var styleSize = $getStyleSize(style.width);
    // round value for browser zoom. desandro/masonry#928
    if (_.isNumber(styleSize)) {
      isBoxSizeOuter = Math.round(styleSize) == 200;
    } else {
      isBoxSizeOuter = false;
    }
    getSize.isBoxSizeOuter = isBoxSizeOuter;
    body.removeChild(div);
  }
  // -------------------------- getSize -------------------------- //
  var getSize = function getSize(elem) {
    setup();
    var style = getStyle(elem);
    // if hidden, everything is 0
    if (style.display == "none") {
      return getZeroSize();
    }
    var size = {};
    size.width = elem.offsetWidth;
    size.height = elem.offsetHeight;
    var isBorderBox = (size.isBorderBox = style.boxSizing == "border-box");
    // get all measurements
    for (var i = 0; i < measurementsLength; i++) {
      var measurement = measurements[i];
      var value = style[measurement];
      var num = parseFloat(value);
      // any 'auto', 'medium' value will be 0
      size[measurement] = !isNaN(num) ? num : 0;
    }
    var paddingWidth = size.paddingLeft + size.paddingRight;
    var paddingHeight = size.paddingTop + size.paddingBottom;
    var marginWidth = size.marginLeft + size.marginRight;
    var marginHeight = size.marginTop + size.marginBottom;
    var borderWidth = size.borderLeftWidth + size.borderRightWidth;
    var borderHeight = size.borderTopWidth + size.borderBottomWidth;
    var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;
    // overwrite width and height if we can get it from style
    var styleWidth = $getStyleSize(style.width);
    if (_.isNumber(styleWidth)) {
      size.width =
        styleWidth +
        // add padding and border unless it's already including it
        (isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth);
    }
    var styleHeight = $getStyleSize(style.height);
    if (_.isNumber(styleHeight)) {
      size.height =
        styleHeight +
        // add padding and border unless it's already including it
        (isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight);
    }
    size.innerWidth = size.width - (paddingWidth + borderWidth);
    size.innerHeight = size.height - (paddingHeight + borderHeight);
    size.outerWidth = size.width + marginWidth;
    size.outerHeight = size.height + marginHeight;
    return size;
  };
  return getSize;
})();
class $Dom {
  constructor(selector, context = $doc) {
    if (!selector) return;
    if (is$Dom(selector)) return selector;
    let eles = selector;
    if (_.isString(selector)) {
      const ctx = is$Dom(context) ? context[0] : context;
      eles = $idRe.test(selector)
        ? ctx.getElementById(selector.slice(1))
        : htmlRe.test(selector)
        ? $parseHTML(selector)
        : $find(selector, ctx);
      if (!eles) return;
    } else if (_.isFunction(selector)) {
      return this.ready(selector); //FIXME: `fn.ready` is not included in `core`, but it's actually a core functionality
    }
    if (eles.nodeType || eles === $win) {
      eles = [eles];
    }
    this.length = eles.length;
    for (let i = 0, l = this.length; i < l; i++) {
      this[i] = eles[i];
    }
  }
  init(selector, context) {
    return new $Dom(selector, context);
  }
}
const $dom = $Dom.prototype.init;
$dom.fn = $dom.prototype = $Dom.prototype; // Ensuring that `$dom() instanceof $dom`
// Static methods on $dom
Object.assign($dom, {
  each: $each,
  extend: $extend,
  guid: 1,
  parseHTML: $parseHTML,
  unique: $unique,
  is$Dom: is$Dom,
  getPrefixedProp: $getPrefixedProp,
  computeStyle: $computeStyle,
  getScript: $getScript
});
$Dom.prototype.length = 0;
$Dom.prototype.splice = Array.prototype.splice; // Ensuring a $dom collection gets printed as array-like in Chrome's devtools
if (typeof Symbol === "function") {
  // Ensuring a $dom collection is iterable
  $Dom.prototype[Symbol["iterator"]] = Array.prototype[Symbol["iterator"]];
}
$Dom.prototype.extend = function (plugins) {
  return $extend($Dom.prototype, plugins);
};
const $JSONStringRe = /^\s+|\s+$/;
function $attempt(fn, arg) {
  try {
    return fn(arg);
  } catch (_a) {
    return arg;
  }
}
function $getData(ele, key) {
  const value = ele.dataset[key] || ele.dataset[$camelCase(key)];
  if ($JSONStringRe.test(value)) {
    return value;
  }
  return $attempt(JSON.parse, value);
}
function $setData(ele, key, value) {
  value = $attempt(JSON.stringify, value);
  ele.dataset[$camelCase(key)] = value;
}
function $data(name, value) {
  if (!name) {
    if (!this[0]) return;
    const datas = {};
    for (const key in this[0].dataset) {
      datas[key] = $getData(this[0], key);
    }
    return datas;
  }
  if (_.isString(name)) {
    if (arguments.length < 2) return this[0] && $getData(this[0], name);
    return this.each((i, ele) => {
      $setData(ele, name, value);
    });
  }
  for (const key in name) {
    this.data(key, name[key]);
  }
  return this;
}
const $DomManipulationMixin = {
  detach() {
    return this.each((i, ele) => {
      if (ele.parentNode) {
        ele.parentNode.removeChild(ele);
      }
    });
  },
  after() {
    return $insertSelectors(arguments, this, {
      inverse: false,
      left: false,
      inside: false,
      reverseLoopSelectorsArgs: true,
      reverseLoop2: true
    });
  },
  appendTo(selector) {
    return $insertSelectors(arguments, this, {
      inverse: true,
      left: false,
      inside: true
    });
  },
  append() {
    return $insertSelectors(arguments, this, {
      inverse: false,
      left: false,
      inside: true
    });
  },
  before() {
    return $insertSelectors(arguments, this, { inverse: false, left: true });
  },
  clone() {
    return this.map((i, ele) => ele.cloneNode(true));
  },
  empty() {
    return this.each((i, ele) => {
      while (ele.firstChild) {
        ele.removeChild(ele.firstChild);
      }
    });
  },
  html: $html,
  insertAfter(selector) {
    return $insertSelectors(arguments, this, {
      inverse: true,
      left: false,
      inside: false,
      reverseLoopSelectorsArgs: false,
      reverseLoop2: false,
      reverseLoop3: true
    });
  },
  insertBefore(selector) {
    return $insertSelectors(arguments, this, { inverse: true, left: true });
  },
  prependTo(selector) {
    return $insertSelectors(arguments, this, {
      inverse: true,
      left: true,
      inside: true,
      reverseLoopSelectorsArgs: false,
      reverseLoop2: false,
      reverseLoop3: true
    });
  },
  prepend() {
    return $insertSelectors(arguments, this, {
      inverse: false,
      left: true,
      inside: true,
      reverseLoopSelectorsArgs: true,
      reverseLoop2: true
    });
  },
  remove() {
    return this.detach().off();
  },
  replaceAll(selector) {
    $dom(selector).replaceWith(this);
    return this;
  },
  replaceWith(selector) {
    return this.before(selector).remove();
  },
  text: $text,
  unwrap() {
    this.parent().each((i, ele) => {
      const $ele = $dom(ele);
      $ele.replaceWith($ele.children());
    });
    return this;
  },
  wrapAll(selector) {
    let structure = $dom(selector),
      wrapper = structure[0];
    while (wrapper.children.length) {
      wrapper = wrapper.firstElementChild;
    }
    this.first().before(structure);
    return this.appendTo(wrapper);
  },
  wrapInner(selector) {
    return this.each((i, ele) => {
      const $ele = $dom(ele),
        contents = $ele.contents();
      contents.length ? contents.wrapAll(selector) : $ele.append(selector);
    });
  },
  wrap(selector) {
    return this.each((i, ele) => {
      const wrapper = $dom(selector)[0];
      $dom(ele).wrapAll(!i ? wrapper : wrapper.cloneNode(true));
    });
  }
};
const $DomAttributesMixin = {
  addClass(cls) {
    return this.toggleClass(cls, true);
  },
  attr: $attr,
  hasClass(cls) {
    return (
      !!cls &&
      Array.prototype.some.call(this, (ele) => ele.classList.contains(cls))
    );
  },
  prop(prop, value) {
    if (!prop) return;
    if (_.isString(prop)) {
      if (arguments.length < 2) return this[0] && this[0][prop];
      return this.each((i, ele) => {
        ele[prop] = value;
      });
    }
    for (const key in prop) {
      this.prop(key, prop[key]);
    }
    return this;
  },
  removeAttr(attr) {
    const attrs = $getSplitValues(attr);
    return this.each((i, ele) => {
      $each(attrs, (i, a) => {
        ele.removeAttribute(a);
      });
    });
  },
  removeClass(cls) {
    if (arguments.length) {
      return this.toggleClass(cls, false);
    }
    return this.attr("class", "");
  },
  removeProp(prop) {
    return this.each((i, ele) => {
      delete ele[prop];
    });
  },
  toggleClass(cls, force) {
    const classes = $getSplitValues(cls),
      isForce = !_.isUndefined(force);
    return this.each((i, ele) => {
      $each(classes, (i, c) => {
        if (isForce) {
          force ? ele.classList.add(c) : ele.classList.remove(c);
        } else {
          ele.classList.toggle(c);
        }
      });
    });
  }
};
const $DomCollectionMixin = {
  add(selector, context) {
    return $dom($unique(this.get().concat($dom(selector, context).get())));
  },
  each(callback) {
    return $each(this, callback);
  },
  eq(index) {
    return $dom(this.get(index));
  },
  filter(comparator) {
    const compare = $getCompareFunction(comparator);
    return $dom(
      Array.prototype.filter.call(this, (ele, i) => compare.call(ele, i, ele))
    );
  },
  first() {
    return this.eq(0);
  },
  get(index) {
    if (_.isUndefined(index)) {
      return Array.prototype.slice.call(this);
    }
    return this[index < 0 ? index + this.length : index];
  },
  index(selector) {
    const child = selector ? $dom(selector)[0] : this[0],
      collection = selector
        ? this
        : $Dom.prototype.init(child).parent().children();
    return Array.prototype.indexOf.call(collection, child);
  },
  last() {
    return this.eq(-1);
  },
  map(callback) {
    return $dom(
      Array.prototype.map.call(this, (ele, i) => callback.call(ele, i, ele))
    );
  },
  slice(start, end) {
    return $dom(Array.prototype.slice.call(this, start, end));
  }
};
const $DomCssMixin = {
  css: $css
};
const $DomDataMixin = {
  data: $data
};
const $DomDimensionsMixin = {
  width(value) {
    if (_.isUndefined(this[0])) {
      return _.isUndefined(value) ? undefined : this;
    }
    if (!arguments.length) {
      if (isWindow(this[0])) {
        return this[0][$camelCase("outer-width")];
      }
      return (
        this.get(0).getBoundingClientRect().width -
        $getExtraSpace(this[0], true)
      );
    }
    const valueNumber = parseInt(value.toString(), 10);
    return this.each((i, ele) => {
      if (!isElement(ele)) return;
      const boxSizing = $computeStyle(ele, "boxSizing");
      ele.style.width = $getSuffixedValue(
        "width",
        valueNumber +
          (boxSizing === "border-box" ? $getExtraSpace(ele, true) : 0)
      );
    });
  },
  height(value) {
    if (_.isUndefined(this[0])) {
      return _.isUndefined(value) ? undefined : this;
    }
    if (!arguments.length) {
      if (isWindow(this[0])) {
        return this[0][$camelCase("outer-height")];
      }
      return (
        this.get(0).getBoundingClientRect().height -
        $getExtraSpace(this[0], false)
      );
    }
    const valueNumber = parseInt(value.toString(), 10);
    return this.each((i, ele) => {
      if (!isElement(ele)) return;
      const boxSizing = $computeStyle(ele, "boxSizing");
      ele.style.height = $getSuffixedValue(
        "height",
        valueNumber +
          (boxSizing === "border-box" ? $getExtraSpace(ele, true) : 0)
      );
    });
  },
  outerWidth(includeMargins) {
    if (!this[0]) {
      return;
    }
    if (isWindow(this[0])) {
      return $win.outerWidth;
    }
    if (!includeMargins) {
      return this.get(0).offsetWidth;
    }
    return (
      this.get(0).offsetHeight +
      $computeStyleInt(this.get(0), "marginLeft") +
      $computeStyleInt(this.get(0), "marginRight")
    );
  },
  outerHeight(includeMargins) {
    if (!this[0]) {
      return;
    }
    if (isWindow(this[0])) {
      return $win.outerHeight;
    }
    if (!includeMargins) {
      return this.get(0).offsetHeight;
    }
    return (
      this.get(0).offsetHeight +
      $computeStyleInt(this.get(0), "marginBottom") +
      $computeStyleInt(this.get(0), "marginTop")
    );
  },
  innerWidth() {
    if (!this[0]) {
      return;
    }
    if (isWindow(this[0])) {
      return $win.innerWidth;
    }
    return this.get(0).clientWidth;
  },
  innerHeight() {
    if (!this[0]) {
      return;
    }
    if (isWindow(this[0])) {
      return $win.innerHeight;
    }
    return this.get(0).clientHeight;
  },
  getSize() {
    return $getSize(this.get(0));
  }
};
function $addEvent(ele, name, namespaces, selector, callback) {
  callback.guid = callback.guid || $dom.guid++;
  const eventCache = $getEventsCache(ele);
  eventCache[name] = eventCache[name] || [];
  eventCache[name].push([namespaces, selector, callback]);
  ele.addEventListener(name, callback);
}
const $DomEventsMixin = {
  off(events, callback, offParams = {}) {
    if (_.isUndefined(events)) {
      this.each((i, ele) => {
        $removeEvent(ele);
      });
    } else {
      $each($getSplitValues(events), (i, eventFullName) => {
        const [name, namespaces] = $parseEventName(
          $getEventNameBubbling(eventFullName)
        );
        this.each((i, ele) => {
          $removeEvent(ele, name, namespaces, offParams.delegate, callback);
        });
      });
    }
    return this;
  },
  on(event, callback, params = {}) {
    $each($getSplitValues(event), (i, eventFullName) => {
      const [originalName, namespaces] = $parseEventName(eventFullName),
        name = $getEventNameBubbling(originalName),
        isEventHover = originalName in $eventsHover,
        isEventFocus = originalName in $eventsFocus;
      if (!name) {
        return;
      }
      this.each((i, ele) => {
        if (!isElement(ele) && !isDocument(ele) && !isWindow(ele)) {
          return;
        }
        const finalCallback = function (ev) {
          if (ev.target[`___i${ev.type}`]) {
            return ev.stopImmediatePropagation(); // Ignoring native event in favor of the upcoming custom one
          }
          if (
            !params.delegate &&
            ((isEventFocus && (ev.target !== ele || ev.___ot === name)) ||
              (isEventHover &&
                ev.relatedTarget &&
                ele.contains(ev.relatedTarget)))
          ) {
            return;
          }
          if (
            ev.namespace &&
            !$hasNamespaces(
              namespaces,
              ev.namespace.split($eventsNamespacesSeparator)
            )
          ) {
            return;
          }
          let thisArg = ele;
          if (params.delegate) {
            let target = ev.target;
            while (!$matches(target, params.delegate)) {
              if (target === ele) return;
              target = target.parentNode;
              if (!target) return;
            }
            thisArg = target;
            ev.___cd = true; // Delegate
          }
          if (ev.___cd) {
            Object.defineProperty(ev, "currentTarget", {
              configurable: true,
              get() {
                // We need to define a getter for this to work everywhere
                return thisArg;
              }
            });
          }
          const returnValue = callback.call(thisArg, ev, ev.data);
          if (params._one) {
            $removeEvent(ele, name, namespaces, params.delegate, finalCallback);
          }
          if (returnValue === false) {
            ev.preventDefault();
            ev.stopPropagation();
          }
        };
        finalCallback.guid = callback.guid = callback.guid || $dom.guid++;
        $addEvent(ele, name, namespaces, params.delegate, finalCallback);
      });
    });
    return this;
  },
  one(event, callback, params = {}) {
    const onParams = Object.assign(params, { _one: true });
    return this.on(event, callback, onParams);
  },
  trigger(event, data) {
    if (_.isString(event)) {
      const [name, namespaces] = $parseEventName(event),
        type = $eventsMouseRe.test(name) ? "MouseEvents" : "HTMLEvents";
      event = $doc.createEvent(type);
      event.initEvent(name, true, true);
      event.namespace = namespaces.join($eventsNamespacesSeparator);
    }
    event.data = data;
    const isEventFocus = event.type in $eventsFocus;
    return this.each((i, ele) => {
      const _event = event;
      if (isEventFocus && _.isFunction(ele[_event.type])) {
        ele[_event.type]();
      } else {
        ele.dispatchEvent(_event);
      }
    });
  }
};
function $getValue(ele) {
  if (ele.multiple && ele.options) {
    const opts = ele.options;
    const filteredEle = Array.prototype.filter.call(opts, (option) => {
      option.selected && !option.disabled && !option.parentNode.disabled;
    });
    return filteredEle.map((o) => o.value);
  }
  return ele.value || "";
}
const skippableRe = /file|reset|submit|button|image/i,
  checkableRe = /radio|checkbox/i;
const $DomFormMixin = {
  serialize() {
    let query = "";
    this.each((i, ele) => {
      if (!isHtmlFormElement(ele)) {
        return;
      }
      $each(ele.elements || [ele], (i, ele) => {
        if (
          ele.disabled ||
          !ele.name ||
          ele.tagName === "FIELDSET" ||
          skippableRe.test(ele.type) ||
          (checkableRe.test(ele.type) && !ele.checked)
        )
          return;
        const value = $getValue(ele);
        if (!_.isUndefined(value)) {
          const values = Array.isArray(value) ? value : [value];
          $each(values, (i, value) => {
            query += $queryEncode(ele.name, value);
          });
        }
      });
    });
    return query.slice(1);
  },
  getValue() {
    if (this[0]) {
      return $getValue(this[0]);
    } else {
      return "";
    }
  },
  setValue(value) {
    return this.each((i, ele) => {
      ele.value = value;
    });
  },
  setMultipleValue(val) {
    if (isWindow(this[0]) || isDocument(this[0])) {
      return this;
    }
    return this.each((i, ele) => {
      if ("SELECT" === ele.tagName) {
        const eleValue = Array.isArray(val) ? val : _.isNull(val) ? [] : [val];
        $each(ele.options, (i, option) => {
          option.selected = eleValue.indexOf(option.value) >= 0;
        });
      } else {
        ele.value = val[i];
      }
    });
  }
};
const $DomOffsetMixin = {
  offset() {
    const ele = this[0];
    if (!ele) return;
    const rect = ele.getBoundingClientRect();
    return {
      top: rect.top + $win.pageYOffset - $docEle.clientTop,
      left: rect.left + $win.pageXOffset - $docEle.clientLeft
    };
  },
  offsetParent() {
    return $dom(this[0] && this[0].offsetParent);
  },
  position() {
    const ele = this[0];
    if (!ele) return;
    return {
      left: ele.offsetLeft,
      top: ele.offsetTop
    };
  }
};
function $pluck(arr, prop, deep) {
  const plucked = [];
  for (let i = 0, l = arr.length; i < l; i++) {
    if (_.isString(prop)) {
      let val = arr[i][prop];
      while (val != null) {
        plucked.push(val);
        val = deep ? val[prop] : null;
      }
    } else {
      const val = prop(arr[i]);
      if (val.length) {
        Array.prototype.push.apply(plucked, val);
      }
    }
  }
  return plucked;
}
function $filtered(collection, comparator) {
  return !comparator ? collection : collection.filter(comparator);
}
const $DomTraversalMixin = {
  children(comparator) {
    return $filtered(
      $dom($unique($pluck(this, (ele) => ele.children))),
      comparator
    );
  },
  closest(comparator) {
    const filtered = this.filter(comparator);
    if (filtered.length) return filtered;
    const $parent = this.parent();
    if (!$parent.length) return filtered;
    return $parent.closest(comparator);
  },
  contents() {
    return $dom(
      $unique(
        $pluck(this, (ele) =>
          ele.tagName === "IFRAME" ? [ele.contentDocument] : ele.childNodes
        )
      )
    );
  },
  find(selector) {
    return $dom($unique($pluck(this, (ele) => $find(selector, ele))));
  },
  has(selector) {
    const comparator = _.isString(selector)
      ? (i, ele) => $find(selector, ele).length > 0
      : (i, ele) => ele.contains(selector);
    return this.filter(comparator);
  },
  is(comparator) {
    const compare = $getCompareFunction(comparator);
    return Array.prototype.some.call(this, (ele, i) =>
      compare.call(ele, i, ele)
    );
  },
  next(comparator, _all) {
    return $filtered(
      $dom($unique($pluck(this, "nextElementSibling", _all))),
      comparator
    );
  },
  nextAll(comparator) {
    return this.next(comparator, true);
  },
  not(comparator) {
    const compare = $getCompareFunction(comparator);
    return this.filter((i, ele) => !compare.call(ele, i, ele));
  },
  parent(comparator) {
    return $filtered($dom($unique($pluck(this, "parentNode"))), comparator);
  },
  parents(comparator) {
    return $filtered(
      $dom($unique($pluck(this, "parentElement", true))),
      comparator
    );
  },
  prev(comparator, _all) {
    return $filtered(
      $dom($unique($pluck(this, "previousElementSibling", _all))),
      comparator
    );
  },
  prevAll(comparator) {
    return this.prev(comparator, true);
  },
  siblings(comparator) {
    return $filtered(
      $dom(
        $unique($pluck(this, (ele) => $dom(ele).parent().children().not(ele)))
      ),
      comparator
    );
  }
};
Object.assign(
  $Dom.prototype,
  {
    extend(plugins) {
      return $dom.extend($Dom.prototype, plugins);
    },
    ready(callback) {
      if ($doc.readyState !== "loading") {
        callback($dom);
      } else {
        $doc.addEventListener("DOMContentLoaded", () => {
          callback($dom);
        });
      }
      return this;
    }
  },
  $DomAttributesMixin,
  $DomManipulationMixin,
  $DomCollectionMixin,
  $DomCssMixin,
  $DomDataMixin,
  $DomDimensionsMixin,
  $DomEventsMixin,
  $DomFormMixin,
  $DomOffsetMixin,
  $DomTraversalMixin
);

// type MnEventIteratee = onApi | offApi | onceMap;
// Regular expression used to split event strings.
const eventSplitter = /\s+/;
const EventMixinOnOffApi = (iteratee, events, name, callback, opts) => {
  if (name && _.isPlainObject(name)) {
    // Handle event maps.
    if (
      !_.isUndefined(callback) &&
      "context" in opts &&
      _.isUndefined(opts.context)
    ) {
      opts.context = callback;
    }
    const names = _.keys(name);
    for (let i = 0; i < names.length; i += 1) {
      events = EventMixinOnOffApi(
        iteratee,
        events,
        names[i],
        name[names[i]],
        opts
      );
    }
  } else if (name && eventSplitter.test(name)) {
    // Handle space-separated event names by delegating them individually.
    const names = name.split(eventSplitter);
    for (let j = 0; j < names.length; j += 1) {
      events = iteratee(events, names[j], callback, opts);
    }
  } else {
    // Finally, standard events.
    events = iteratee(events, name, callback, opts);
  }
  return events;
};
const EventMixinTriggerApi = (iteratee, events, name, ...args) => {
  if (name && eventSplitter.test(name)) {
    // Handle space-separated event names by delegating them individually.
    const names = name.split(eventSplitter);
    for (let j = 0; j < names.length; j += 1) {
      events = iteratee(events, names[j], args);
    }
  } else {
    // Finally, standard events.
    events = iteratee(events, name, args);
  }
  return events;
};
const EventMixinOnceApi = function (iteratee, events, name, callback, opts) {
  let i = 0,
    names;
  if (name && typeof name === "object") {
    // Handle event maps.
    if (callback !== void 0 && "context" in opts && opts.context === void 0) {
      opts.context = callback;
    }
    const names = _.keys(name);
    for (let i = 0; i < names.length; i++) {
      events = EventMixinOnceApi(
        iteratee,
        events,
        names[i],
        name[names[i]],
        opts
      );
    }
  } else if (name && eventSplitter.test(name)) {
    // Handle space-separated event names by delegating them individually.
    for (names = name.split(eventSplitter); i < names.length; i++) {
      events = iteratee(events, names[i], callback, opts);
    }
  } else {
    // Finally, standard events.
    events = iteratee(events, name, callback, opts);
  }
  return events;
};

const onApi = function (events, name, callback, options) {
  if (callback) {
    var handlers = events[name] || (events[name] = []);
    var context = options.context,
      ctx = options.ctx,
      listening = options.listening;
    if (listening) listening.count++;
    handlers.push({
      callback: callback,
      context: context,
      ctx: context || ctx,
      listening: listening
    });
  }
  return events;
};

// Guard the `listening` argument from the public API.
const internalOn = function (obj, name, callback, context, listening) {
  obj._events = EventMixinOnOffApi(onApi, obj._events || {}, name, callback, {
    context: context,
    ctx: obj,
    listening: listening
  });
  if (listening) {
    var listeners = obj._listeners || (obj._listeners = {});
    listeners[listening.id] = listening;
  }
  return obj;
};

const EventMixinListenTo = {
  listenTo(obj, events, callback) {
    if (!obj) return this;
    var id = obj._listenId || (obj._listenId = _.uniqueId("l"));
    var listeningTo = this._listeningTo || (this._listeningTo = {});
    var listening = listeningTo[id];
    // This object is not listening to any other events on `obj` yet.
    // Setup the necessary references to track the listening callbacks.
    if (!listening) {
      var thisId = this._listenId || (this._listenId = _.uniqueId("l"));
      listening = listeningTo[id] = {
        obj: obj,
        objId: id,
        id: thisId,
        listeningTo: listeningTo,
        count: 0
      };
    }
    // Bind callbacks on obj, and keep track of them on listening.
    internalOn(obj, events, callback, this, listening);
    return this;
  }
};

const EventMixinOn = Object.assign(EventMixinListenTo, {
  on(events, callback, context) {
    return internalOn(this, events, callback, context);
  }
});

// Reduces the event callbacks into a map of `{event: onceWrapper}`.
// `offer` unbinds the `onceWrapper` after it has been called.
const onceMap = function (map, name, callback, offer) {
  if (callback) {
    var _once = (map[name] = _.once(function () {
      offer(name, _once);
      callback.apply(this, arguments);
    }));
    _once._callback = callback;
  }
  return map;
};

const EventMixinOnce = {
  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, its listener will be removed. If multiple events
  // are passed in using the space-separated syntax, the handler will fire
  // once for each event, not once for a combination of all events.
  once(eventsName, callback, context) {
    const eventsMap = EventMixinOnceApi(
      onceMap,
      {},
      eventsName,
      callback,
      this.off.bind(this)
    );
    // if (typeof eventsName === "string" && context == null) {
    //   callback = void 0;
    // }
    return this.on(eventsMap);
  },
  // Inversion-of-control versions of `once`.
  listenToOnce(obj, eventName, callback) {
    // Map the event into a `{event: once}` object.
    // var events = eventsApi(onceMap, {}, eventName, callback, _.bind(this.stopListening, this, obj));
    var events = EventMixinOnceApi(
      onceMap,
      {},
      eventName,
      callback,
      this.stopListening.bind(this, obj)
    );
    return this.listenTo(obj, events);
  }
};

// The reducing API that removes a callback from the `events` object.
const offApi = function (events, name, callback, options) {
  if (!events) {
    return;
  }
  var context = options.context,
    listeners = options.listeners;
  // Delete all events listeners and "drop" events.
  if (!name && !callback && !context) {
    var ids = _.keys(listeners);
    for (let i = 0; i < ids.length; i++) {
      const listening = listeners[ids[i]];
      delete listeners[listening.id];
      delete listening.listeningTo[listening.objId];
    }
    return;
  }
  const names = name ? [name] : _.keys(events);
  for (let i = 0; i < names.length; i++) {
    name = names[i];
    var handlers = events[name];
    // Bail out if there are no events stored.
    if (!handlers) break;
    // Replace events if there are any remaining.  Otherwise, clean up.
    var remaining = [];
    for (var j = 0; j < handlers.length; j++) {
      var handler = handlers[j];
      if (
        (callback &&
          callback !== handler.callback &&
          callback !== handler.callback._callback) ||
        (context && context !== handler.context)
      ) {
        remaining.push(handler);
      } else {
        const listening = handler.listening;
        if (listening && --listening.count === 0) {
          delete listeners[listening.id];
          delete listening.listeningTo[listening.objId];
        }
      }
    }
    // Update tail event if the list has any events.  Otherwise, clean up.
    if (remaining.length) {
      events[name] = remaining;
    } else {
      delete events[name];
    }
  }
  return events;
};

const EventMixinStopListening = {
  stopListening(obj, eventName, callback) {
    const listeningTo = this._listeningTo;
    if (!listeningTo) {
      return this;
    }
    var ids = obj ? [obj._listenId] : _.keys(listeningTo);
    for (var i = 0; i < ids.length; i++) {
      var listening = listeningTo[ids[i]];
      // If listening doesn't exist, this object is not currently
      // listening to obj. Break out early.
      if (!listening) break;
      listening.obj.off(eventName, callback, this);
    }
    return this;
  }
};

const EventMixinOff = Object.assign(EventMixinStopListening, {
  off(eventName, callback, context) {
    if (!this._events) {
      return this;
    }
    this._events = EventMixinOnOffApi(
      offApi,
      this._events,
      eventName,
      callback,
      {
        context: context,
        listeners: this._listeners
      }
    );
    return this;
  }
});

// A difficult-to-believe, but optimized internal dispatch function for
// triggering events. Tries to keep the usual cases speedy (most internal
// Marionette events have 3 arguments).
const triggerEvents = function (events, args) {
  var ev,
    i = -1,
    l = events.length,
    a1 = args[0],
    a2 = args[1],
    a3 = args[2];
  switch (args.length) {
    case 0:
      while (++i < l) (ev = events[i]).callback.call(ev.ctx);
      return;
    case 1:
      while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1);
      return;
    case 2:
      while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2);
      return;
    case 3:
      while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
      return;
    default:
      while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
      return;
  }
};
const eventTriggerApi = function (objEvents, name, args) {
  if (objEvents) {
    var events = objEvents[name];
    var allEvents = objEvents.all;
    if (events && allEvents) {
      allEvents = allEvents.slice();
    }
    if (events) {
      triggerEvents(events, args);
    }
    if (allEvents) {
      triggerEvents(allEvents, [name].concat(args));
    }
  }
  return objEvents;
};

const EventMixinTrigger = {
  trigger(eventName, ...args) {
    if (!this._events) {
      return this;
    }
    EventMixinTriggerApi(eventTriggerApi, this._events, eventName, ...args);
    return this;
  }
};

const EventMixin = Object.assign(
  EventMixinOn,
  EventMixinOff,
  EventMixinOnce,
  EventMixinTrigger
);

class Model {
  constructor(attributes = {}, options = {}) {
    let attrs = attributes || {};
    this.cid = _.uniqueId(this.cidPrefix);
    this.attributes = {};
    if (options.collection) {
      this.collection = options.collection;
    }
    // if (options.parse) {
    //   attrs = this.parse(attrs, options) || {};
    // }
    var _defaults = _.result(this, "defaults");
    attrs = _.defaults(Object.assign({}, _defaults, attrs), _defaults);
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  }
}
Model.extend = function (protoProps) {
  const Parent = this;
  let classProperties = {};
  for (let prop in protoProps) {
    if (typeof protoProps[prop] !== "function") {
      classProperties[prop] = protoProps[prop];
    }
  }
  class ExtendedModel extends Parent {
    constructor(options = {}) {
      // for Behavior class, we need the view argument
      Object.assign(classProperties, options);
      super(classProperties);
    }
  }
  ExtendedModel.__super__ = Parent.prototype;
  // Add static properties to the constructor function, if supplied.
  Object.assign(ExtendedModel, Parent);
  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function and add the prototype properties.
  Object.assign(ExtendedModel.prototype, Parent.prototype, protoProps);
  ExtendedModel.prototype.constructor = ExtendedModel;
  // Set a convenience property in case the parent"s prototype is needed
  // later.
  ExtendedModel.__super__ = Parent.prototype;
  return ExtendedModel;
};
let ModelProto = Model.prototype;
Object.assign(Model.prototype, EventMixin);
ModelProto.initialize = function () {};
ModelProto.validationError = null;
ModelProto.idAttribute = "id";
ModelProto.cidPrefix = "c";
ModelProto.changed = null;
ModelProto.toJSON = function (options) {
  return _.clone(this.attributes);
};
ModelProto.get = function (attr) {
  return this.attributes[attr];
};
ModelProto.escape = function (attr) {
  return _.escape(this.get(attr));
};
ModelProto.has = function (attr) {
  return this.get(attr) != null;
};
ModelProto.matches = function (attrs) {
  return _.matches(attrs)(this.attributes);
};
ModelProto.parse = function (response, options) {
  return response;
};
ModelProto.set = function (key, val, options) {
  var attrs;
  if (typeof key === "object") {
    attrs = key;
    options = val;
  } else {
    (attrs = {})[key] = val;
  }
  options || (options = {});
  // Run validation.
  if (!this._validate(attrs, options)) return false;
  // Extract attributes and options.
  var unset = options.unset;
  var silent = options.silent;
  var changes = [];
  var changing = this._changing;
  this._changing = true;
  if (!changing) {
    this._previousAttributes = _.clone(this.attributes);
    this.changed = {};
  }
  var current = this.attributes;
  var changed = this.changed;
  var prev = this._previousAttributes;
  // For each `set` attribute, update or delete the current value.
  for (var attr in attrs) {
    val = attrs[attr];
    if (!_.isEqual(current[attr], val)) {
      changes.push(attr);
    }
    if (!_.isEqual(prev[attr], val)) {
      changed[attr] = val;
    } else {
      delete changed[attr];
    }
    unset ? delete current[attr] : (current[attr] = val);
  }
  // Update the `id`.
  if (this.idAttribute in attrs) {
    this.id = this.get(this.idAttribute);
  }
  // Trigger all relevant attribute changes.
  if (!silent) {
    if (changes.length) this._pending = options;
    for (let i = 0; i < changes.length; i++) {
      this.trigger("change:" + changes[i], this, current[changes[i]], options);
    }
  }
  // You might be wondering why there"s a `while` loop here. Changes can
  // be recursively nested within `"change"` events.
  if (changing) return this;
  if (!silent) {
    while (this._pending) {
      options = this._pending;
      this._pending = false;
      this.trigger("change", this, options);
    }
  }
  this._pending = false;
  this._changing = false;
  return this;
};
ModelProto.unset = function (attribute, options) {
  return this.set(
    attribute,
    void 0,
    Object.assign({}, options, { unset: true })
  );
};
ModelProto.clear = function (options) {
  let attrs = {};
  for (let key in this.attributes) {
    attrs[key] = void 0;
  }
  return this.set(attrs, Object.assign({}, options, { unset: true }));
};
ModelProto.hasChanged = function (attr) {
  if (attr == null) {
    return !_.isEmpty(this.changed);
  }
  return _.has(this.changed, attr);
};
ModelProto.hasChanged = function (attribute) {
  if (attribute == null) {
    return !_.isEmpty(this.changed);
  }
  return _.has(this.changed, attribute);
};
ModelProto.changedAttributes = function (diff) {
  if (!diff) {
    return this.hasChanged() ? _.clone(this.changed) : false;
  }
  const old = this._changing ? this._previousAttributes : this.attributes;
  let changed = {};
  for (let attr in diff) {
    let val = diff[attr];
    if (_.isEqual(old[attr], val)) {
      continue;
    }
    changed[attr] = val;
  }
  return _.size(changed) ? changed : false;
};
ModelProto.previous = function (attribute) {
  if (attribute == null) {
    return null;
  }
  return this._previousAttributes[attribute];
};
ModelProto.previousAttributes = function () {
  return _.clone(this._previousAttributes);
};
ModelProto.clone = function () {
  const ModelConstructor = this.constructor;
  return new ModelConstructor(this.attributes);
};
ModelProto.isValid = function (options) {
  return this._validate({}, Object.assign({}, options, { validate: true }));
};
ModelProto._validate = function (attrs, options) {
  if (!options.validate || typeof this.validate == "undefined") {
    return true;
  }
  attrs = Object.assign({}, this.attributes, attrs);
  var error = (this.validationError = this.validate(attrs, options) || null);
  if (!error) return true;
  this.trigger(
    "invalid",
    this,
    error,
    Object.assign(options, { validationError: error })
  );
  return false;
};
ModelProto.keys = function () {
  return Object.keys(this.attributes);
};
ModelProto.values = function () {
  return Object.keys(this.attributes).map(function (key) {
    return this.attributes[key];
  });
};
ModelProto.invert = function () {
  return _.invert(this.attributes);
};
ModelProto.pick = function () {
  var args = Array.prototype.slice.call(arguments);
  // args.unshift(this.attributes);
  // return pick.apply()
  return _.pick(this.attributes, args); // TO TEST ???
};
ModelProto.omit = function () {
  var args = Array.prototype.slice.call(arguments);
  return _.omit(this.attributes, args);
};
ModelProto.isEmpty = function () {
  return _.isEmpty(this.attributes);
};
/**
 * UNUSED :
 *
interface Model {
  // A model is new if it has never been saved to the server, and lacks an id.
  isNew(): boolean;

  // **parse** converts a response into the hash of attributes to be `set` on
  // the model. The default implementation is just to pass the response along.
  parse(response: any, options?: any): any;

  // Fetch the model from the server, merging the response with the model"s
  // local attributes. Any changed attributes will trigger a "change" event.
  fetch(options?: ModelFetchOptions): JQueryXHR;

  // Proxy `Marionette.sync` by default.
  sync(...arg: any[]): JQueryXHR;

  // Set a hash of model attributes, and sync the model to the server.
  // If the server returns an attributes hash that differs, the model"s
  // state will be `set` again.
  save(attributes?: any, options?: ModelSaveOptions): any;

  // Set a hash of model attributes, and sync the model to the server.
  // If the server returns an attributes hash that differs, the model"s
  // state will be `set` again.
  destroy(options?: ModelDestroyOptions): any;

  // Default URL for the model"s representation on the server -- if you"re
  // using Marionette"s restful methods, override this to change the endpoint
  // that will be called.
  url(): string
}

ModelProto.isNew = function (this: Model) {
  return !this.has(this.idAttribute);
};

ModelProto.fetch = function (this: Model, options) {
  options = extend({ parse: true }, options);
  var model = this;
  var success = options.success;
  options.success = function (resp) {
    var serverAttrs = options.parse ? model.parse(resp, options) : resp;
    if (!model.set(serverAttrs, options)) return false;
    if (success) success.call(options.context, model, resp, options);
    model.trigger("sync", model, resp, options);
  };
  wrapError(this, options);
  return this.sync("read", this, options);
};

ModelProto.sync = function (this: Model) {
  return Marionette.sync.apply(this, arguments);
};

ModelProto.save = function (this: Model, attributes, any) {
  // Handle both `"key", value` and `{key: value}` -style arguments.
  var attrs;
  if (key == null || typeof key === "object") {
    attrs = key;
    options = val;
  } else {
    (attrs = {})[key] = val;
  }

  options = extend({ validate: true, parse: true }, options);
  var wait = options.wait;

  // If we"re not waiting and attributes exist, save acts as
  // `set(attr).save(null, opts)` with validation. Otherwise, check if
  // the model will be valid when the attributes, if any, are set.
  if (attrs && !wait) {
    if (!this.set(attrs, options)) return false;
  } else if (!this._validate(attrs, options)) {
    return false;
  }

  // After a successful server-side save, the client is (optionally)
  // updated with the server-side state.
  var model = this;
  var success = options.success;
  var attributes = this.attributes;
  options.success = function (resp) {
    // Ensure attributes are restored during synchronous saves.
    model.attributes = attributes;
    var serverAttrs = options.parse ? model.parse(resp, options) : resp;
    if (wait) serverAttrs = extend({}, attrs, serverAttrs);
    if (serverAttrs && !model.set(serverAttrs, options)) return false;
    if (success) success.call(options.context, model, resp, options);
    model.trigger("sync", model, resp, options);
  };
  wrapError(this, options);

  // Set temporary attributes if `{wait: true}` to properly find new ids.
  if (attrs && wait) this.attributes = extend({}, attributes, attrs);

  var method = this.isNew() ? "create" : (options.patch ? "patch" : "update");
  if (method === "patch" && !options.attrs) options.attrs = attrs;
  var xhr = this.sync(method, this, options);

  // Restore attributes.
  this.attributes = attributes;

  return xhr;
}

ModelProto.destroy = function (this: Model, options?: ModelDestroyOptions) {
  options = options ? clone(options) : {};
    var model = this;
    var success = options.success;
    var wait = options.wait;

    var destroy = function () {
      model.stopListening();
      model.trigger("destroy", model, model.collection, options);
    };

    options.success = function (resp) {
      if (wait) destroy();
      if (success) success.call(options.context, model, resp, options);
      if (!model.isNew()) model.trigger("sync", model, resp, options);
    };

    var xhr = false;
    if (this.isNew()) {
      defer(options.success);
    } else {
      wrapError(this, options);
      xhr = this.sync("delete", this, options);
    }
    if (!wait) destroy();
    return xhr;
};

ModelProto.url = function (this: Model) {
  var base =
    result(this, "urlRoot") ||
    result(this.collection, "url") ||
    urlError();
  if (this.isNew()) return base;
  var id = this.get(this.idAttribute);
  return base.replace(/[^\/]$/, "$&/") + encodeURIComponent(id);
};
  */

function splice(array, insert, at) {
  at = Math.min(Math.max(at, 0), array.length);
  var tail = Array(array.length - at);
  var length = insert.length;
  for (let i = 0; i < tail.length; i++) {
    tail[i] = array[i + at];
  }
  for (let i = 0; i < length; i++) {
    array[i + at] = insert[i];
  }
  for (let i = 0; i < tail.length; i++) {
    array[i + length + at] = tail[i];
  }
}
/* Marionette.Collection
 *  -------------------
 */
/* If models tend to represent a single row of data, a Marionette Collection is
 * more analogous to a table full of data ... or a small slice or page of that
 * table, or a collection of rows that belong together for a particular reason
 * -- all of the messages in this particular folder, all of the documents
 * belonging to this particular author, and so on. Collections maintain
 * indexes of their models, both in order, and for lookup by `id`.
 *
 * Create a new **Collection**, perhaps to contain a specific type of `model`.
 * If a `comparator` is specified, the Collection will maintain
 * its models in sort order, as they're added and removed.
 */
// Default options for `Collection#set`.
const setOptions = { add: true, remove: true, merge: true };
const addOptions = { add: true, remove: false };
const makeCollectionIterator = (function () {
  const modelMatcher = function modelMatcher(attrs) {
    var matcher = _.matches(attrs);
    return function (model) {
      return matcher(model.attributes);
    };
  };
  return function makeCollectonIterator(iteratee, instance) {
    if (_.isFunction(iteratee)) {
      return iteratee;
    }
    if (_.isObject(iteratee) && !instance._isModel(iteratee)) {
      return modelMatcher(iteratee);
    }
    if (_.isString(iteratee)) {
      return function (model) {
        return model.get(iteratee);
      };
    }
    return iteratee;
  };
})();
class Collection {
  constructor(models, options) {
    options || (options = {});
    this.preinitialize.apply(this, arguments);
    if (options.model) {
      this.model = options.model;
    }
    if (options.comparator !== void 0) {
      this.comparator = options.comparator;
    }
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) {
      this.reset(models, Object.assign({ silent: true }, options));
    }
  }
}
Collection.extend = function (protoProps) {
  const Parent = this;
  let classProperties = {};
  for (let prop in protoProps) {
    if (typeof protoProps[prop] !== "function") {
      classProperties[prop] = protoProps[prop];
    }
  }
  class ExtendedCollection extends Parent {
    constructor(options) {
      super(options);
    }
  }
  // Set a convenience property in case the parent"s prototype is needed later.
  ExtendedCollection.__super__ = Parent.prototype;
  // Add static properties to the constructor function, if supplied.
  Object.assign(ExtendedCollection, Parent);
  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function and add the prototype properties.
  Object.assign(ExtendedCollection.prototype, Parent.prototype, protoProps);
  ExtendedCollection.prototype.constructor = ExtendedCollection;
  return ExtendedCollection;
};
let CollectionProto = Collection.prototype;
Object.assign(Collection.prototype, EventMixin);
CollectionProto._reset = function () {
  this.length = 0;
  this.models = [];
  this._byId = {};
};
CollectionProto.model = Model;
CollectionProto.preinitialize = function () {};
CollectionProto.initialize = function () {};
CollectionProto.toJSON = function (options) {
  return this.map(function (model) {
    return model.toJSON(options);
  });
};
CollectionProto.add = function (models, options) {
  return this.set(models, Object.assign({ merge: false }, options, addOptions));
};
CollectionProto.remove = function (models, options) {
  options = Object.assign({}, options);
  const singular = !Array.isArray(models);
  if (Array.isArray(models)) {
    models = models.slice();
  } else {
    models = [models];
  }
  var removed = this._removeModels(models, options);
  if (!options.silent && removed.length) {
    options.changes = { added: [], merged: [], removed: removed };
    this.trigger("update", this, options);
  }
  return singular ? removed[0] : removed;
};
CollectionProto.parse = function (response, options) {
  return response;
};
CollectionProto.set = function (models, options) {
  if (models == null) {
    return;
  }
  const singular = !Array.isArray(models);
  options = Object.assign({}, setOptions, options);
  if (options.parse && !this._isModel(models)) {
    models = this.parse(models, options) || [];
  }
  if (Array.isArray(models)) {
    models = models.slice();
  } else {
    models = [models];
  }
  let at = options.at;
  if (at != null) {
    at = +at;
  }
  if (at > this.length) {
    at = this.length;
  }
  if (at < 0) {
    at += this.length + 1;
  }
  var set = [];
  var toAdd = [];
  var toMerge = [];
  var toRemove = [];
  var modelMap = {};
  var add = options.add;
  var merge = options.merge;
  var remove = options.remove;
  var sort = false;
  var sortable = this.comparator && at == null && options.sort !== false;
  var sortAttr = _.isString(this.comparator) ? this.comparator : null;
  // Turn bare objects into model references, and prevent invalid models
  // from being added.
  var model, i;
  for (i = 0; i < models.length; i++) {
    model = models[i];
    // If a duplicate is found, prevent it from being added and
    // optionally merge it into the existing model.
    var existing = this.get(model);
    if (existing) {
      if (merge && model !== existing) {
        var attrs = this._isModel(model) ? model.attributes : model;
        if (options.parse) attrs = existing.parse(attrs, options);
        existing.set(attrs, options);
        toMerge.push(existing);
        if (sortable && !sort) sort = existing.hasChanged(sortAttr);
      }
      if (!modelMap[existing.cid]) {
        modelMap[existing.cid] = true;
        set.push(existing);
      }
      models[i] = existing;
      // If this is a new, valid model, push it to the `toAdd` list.
    } else if (add) {
      model = models[i] = this._prepareModel(model, options);
      if (model) {
        toAdd.push(model);
        this._addReference(model);
        modelMap[model.cid] = true;
        set.push(model);
      }
    }
  }
  // Remove stale models.
  if (remove) {
    for (i = 0; i < this.length; i++) {
      model = this.models[i];
      if (!modelMap[model.cid]) toRemove.push(model);
    }
    if (toRemove.length) {
      this._removeModels(toRemove, options);
    }
  }
  // See if sorting is needed, update `length` and splice in new models.
  var orderChanged = false;
  var replace = !sortable && add && remove;
  if (set.length && replace) {
    orderChanged =
      this.length !== set.length ||
      Array.prototype.some.call(this.models, function (m, index) {
        return m !== set[index];
      });
    this.models.length = 0;
    splice(this.models, set, 0);
    this.length = this.models.length;
  } else if (toAdd.length) {
    if (sortable) sort = true;
    splice(this.models, toAdd, at == null ? this.length : at);
    this.length = this.models.length;
  }
  // Silently sort the collection if appropriate.
  if (sort) this.sort({ silent: true });
  // Unless silenced, it's time to fire all appropriate add/sort/update events.
  if (!options.silent) {
    for (i = 0; i < toAdd.length; i++) {
      if (at != null) {
        options.index = at + i;
      }
      model = toAdd[i];
      model.trigger("add", model, this, options);
    }
    if (sort || orderChanged) {
      this.trigger("sort", this, options);
    }
    if (toAdd.length || toRemove.length || toMerge.length) {
      options.changes = {
        added: toAdd,
        removed: toRemove,
        merged: toMerge
      };
      this.trigger("update", this, options);
    }
  }
  // Return the added (or merged) model (or models).
  return singular ? models[0] : models;
};
// When you have more items than you want to add or remove individually,
// you can reset the entire set with a new list of models, without firing
// any granular `add` or `remove` events. Fires `reset` when finished.
// Useful for bulk operations and optimizations.
CollectionProto.reset = function (models, options) {
  let _options = options ? _.clone(options) : {};
  for (let i = 0; i < this.models.length; i++) {
    this._removeReference(this.models[i], options);
  }
  _options.previousModels = this.models;
  this._reset();
  models = this.add(models, Object.assign({ silent: true }, options));
  if (!options.silent) {
    this.trigger("reset", this, options);
  }
  return models;
};
CollectionProto.push = function (model, options) {
  return this.add(model, Object.assign({ at: this.length }, options));
};
CollectionProto.pop = function (options) {
  var model = this.at(this.length - 1);
  return this.remove(model, options);
};
CollectionProto.unshift = function (model, options) {
  return this.add(model, Object.assign({ at: 0 }, options));
};
CollectionProto.shift = function (options) {
  var model = this.at(0);
  return this.remove(model, options);
};
CollectionProto.slice = function (min, max) {
  // return Array.prototype.slice.apply(this.models, arguments);.
  return this.models.slice(min, max);
};
CollectionProto.get = function (obj) {
  if (obj == null) return void 0;
  return (
    this._byId[obj] ||
    this._byId[this.modelId(obj.attributes || obj)] ||
    (obj.cid && this._byId[obj.cid])
  );
};
CollectionProto.has = function (obj) {
  return this.get(obj) != null;
};
CollectionProto.at = function (index) {
  if (index < 0) index += this.length;
  return this.models[index];
};
// Return models with matching attributes. Useful for simple cases of
// `filter`.
CollectionProto.where = function (attrs, first) {
  if (first) {
    return this.find(attrs);
  } else {
    return this.filter(attrs);
  }
};
CollectionProto.findWhere = function (attrs) {
  return this.where(attrs, true);
};
CollectionProto.sort = function (options) {
  var comparator = this.comparator;
  if (!comparator) throw new Error("Cannot sort a set without a comparator");
  options || (options = {});
  comparator.length;
  // Run sort based on type of `comparator`.
  if (_.isFunction(comparator)) {
    this.models.sort(comparator);
  } else {
    this.models = this.sortBy(comparator);
  }
  // if (length === 1 || typeof comparator === "string") {
  //   this.models = this.sortBy(comparator);
  // } else {
  //   this.models.sort(comparator);
  // }
  if (!options.silent) this.trigger("sort", this, options);
  return this;
};
CollectionProto.pluck = function (attr) {
  return this.models.map(function (model) {
    return model.get("attr");
  });
};
CollectionProto.parse = function (resp, options) {
  return resp;
};
CollectionProto.clone = function () {
  return new this.constructor(this.models, {
    model: this.model,
    comparator: this.comparator
  });
};
CollectionProto.modelId = function (attrs) {
  return attrs[this.model.prototype.idAttribute || "id"];
};
CollectionProto._reset = function () {
  this.length = 0;
  this.models = [];
  this._byId = {};
};
CollectionProto._prepareModel = function (attrs, options) {
  if (this._isModel(attrs)) {
    if (!attrs.collection) attrs.collection = this;
    return attrs;
  }
  options = options ? _.clone(options) : {};
  options.collection = this;
  var model = new this.model(attrs, options);
  if (!model.validationError) return model;
  this.trigger("invalid", this, model.validationError, options);
  return false;
};
// Internal method called by both remove and set.
CollectionProto._removeModels = function (models, options) {
  var removed = [];
  for (var i = 0; i < models.length; i++) {
    var model = this.get(models[i]);
    if (!model) continue;
    var index = this.indexOf(model);
    this.models.splice(index, 1);
    this.length--;
    // Remove references before triggering 'remove' event to prevent an
    // infinite loop. #3693
    delete this._byId[model.cid];
    var id = this.modelId(model.attributes);
    if (id != null) delete this._byId[id];
    if (!options.silent) {
      options.index = index;
      model.trigger("remove", model, this, options);
    }
    removed.push(model);
    this._removeReference(model, options);
  }
  return removed;
};
CollectionProto._isModel = function (model) {
  return model instanceof Model;
};
CollectionProto._addReference = function (model) {
  this._byId[model.cid] = model;
  var id = this.modelId(model.attributes);
  if (id != null) this._byId[id] = model;
  model.on("all", this._onModelEvent, this);
};
CollectionProto._removeReference = function (model, options) {
  delete this._byId[model.cid];
  var id = this.modelId(model.attributes);
  if (id != null) delete this._byId[id];
  if (this === model.collection) delete model.collection;
  model.off("all", this._onModelEvent, this);
};
CollectionProto._onModelEvent = function (event, model, collection, options) {
  if (model) {
    if ((event === "add" || event === "remove") && collection !== this) return;
    if (event === "destroy") this.remove(model, options);
    if (event === "change") {
      var prevId = this.modelId(model.previousAttributes());
      var id = this.modelId(model.attributes);
      if (prevId !== id) {
        if (prevId != null) delete this._byId[prevId];
        if (id != null) this._byId[id] = model;
      }
    }
  }
  this.trigger.apply(this, arguments);
};
CollectionProto.sortBy = function (key, sort = "asc") {
  const ascending = "asc" === sort;
  const compareFunction = function compareFunction(key, ModelA, ModelB) {
    if (ModelA.get(key) < ModelB.get(key)) {
      return ascending ? -1 : -1;
    } else if (ModelA.get(key) > ModelB.get(key)) {
      return ascending ? 1 : -1;
    } else {
      return 0;
    }
  };
  if (typeof key === "string") {
    return this.models.sort(function (ModelA, ModelB) {
      if (ModelA.get(key) < ModelB.get(key)) {
        return ascending ? -1 : -1;
      } else if (ModelA.get(key) > ModelB.get(key)) {
        return ascending ? 1 : -1;
      } else {
        return 0;
      }
    });
  } else {
    return this.models.sort(function (ModelA, ModelB) {
      let result;
      for (let i = 0; i < key.length; i += 1) {
        result = compareFunction(key[i], ModelA, ModelB);
        if (result !== 0) {
          break;
        }
      }
      return result;
    });
  }
};
CollectionProto.forEach = function (iterator) {
  this.models.forEach(iterator);
};
CollectionProto.indexOf = function (value, from) {
  return this.models.indexOf(value, from);
};
CollectionProto.lastIndexOf = function (value, from) {
  return this.models.lastIndexOf(value, from);
};
CollectionProto.findIndex = function (predicate) {
  return this.models.findIndex(makeCollectionIterator(predicate, this));
};
CollectionProto.filter = function (predicate) {
  return this.models.filter(makeCollectionIterator(predicate, this));
};
CollectionProto.find = function (predicate) {
  return this.models.find(makeCollectionIterator(predicate, this));
};
CollectionProto.size = function () {
  return this.models.length + 1;
};
CollectionProto.first = function (n) {
  if (!n) {
    return this.models[0];
  } else {
    return this.models.slice(0, n);
  }
};
CollectionProto.some = function (predicate) {
  return this.models.some(makeCollectionIterator(predicate, this));
};
CollectionProto.every = function (predicate) {
  return this.models.every(makeCollectionIterator(predicate, this));
};
CollectionProto.contains = function (value) {
  return this.models.includes(value);
};
CollectionProto.shuffle = function () {
  return _.shuffle(this.models);
};
CollectionProto.isEmpty = function () {
  return this.models.length > 0;
};
CollectionProto.countBy = function (predicate) {
  return _.countBy(this.models, makeCollectionIterator(predicate, this));
};
CollectionProto.groupBy = function (predicate) {
  return _.groupBy(this.models, makeCollectionIterator(predicate, this));
};
CollectionProto.map = function (iterator) {
  return this.models.map(iterator);
};
CollectionProto.sample = function () {
  return _.sample(this.models);
};

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
      if (Error.captureStackTrace) {
        this.captureStackTrace();
      }
    }
    captureStackTrace() {
      Error.captureStackTrace(this, MnError);
    }
    toString() {
      return `${this.name}: ${this.message}`;
    }
  };
})();

const normalizeMethods$1 = function (hash) {
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

function normalizeBindings(context, bindings) {
  if (!_.isObject(bindings)) {
    throw new MnError({
      message: "Bindings must be an object."
    });
  }
  return normalizeMethods$1.call(context, bindings);
}

// Bind Entity Events & Unbind Entity Events
const _bindEvents = function (entity, bindings) {
  if (!entity || !bindings) {
    return this;
  }
  this.listenTo(entity, normalizeBindings(this, bindings));
  return this;
};
const _unbindEvents = function (entity, bindings) {
  if (!entity) {
    return this;
  }
  if (!bindings) {
    this.stopListening(entity);
    return this;
  }
  this.stopListening(entity, normalizeBindings(this, bindings));
  return this;
};

// Bind/Unbind Radio Requests
const _bindRequests = function _bindRequests(channel, bindings) {
  if (!channel || !bindings) {
    return this;
  }
  channel.reply(normalizeBindings(this, bindings), this);
  return this;
};
const _unbindRequests = function _unbindRequests(channel, bindings) {
  if (!channel) {
    return this;
  }
  if (!bindings) {
    channel.stopReplying(null, null, this);
    return this;
  }
  channel.stopReplying(normalizeBindings(this, bindings));
  return this;
};

// Marionette.getOptions
// --------------------
// Retrieve an object, function or other value from the
// object or its `options`, with `options` taking precedence.
const getOptions = function (optionName) {
  if (!optionName) {
    return;
  }
  if (this.options && this.options[optionName] !== undefined) {
    return this.options[optionName];
  } else {
    return this[optionName];
  }
};

const mergeOptions$1 = function (options, keys) {
  if (!options) {
    return;
  }
  keys.forEach((key) => {
    const option = options[key];
    if (option !== undefined) {
      this[key] = option;
    }
  });
};

// Trigger method on children unless a pure Backbone.View
function triggerMethodChildren(view, event, shouldTrigger) {
  if (!view._getImmediateChildren) {
    return;
  }
  view._getImmediateChildren().forEach((child) => {
    if (!shouldTrigger(child)) {
      return;
    }
    child.triggerMethod(event, child);
  });
}
function shouldTriggerAttach(view) {
  return !view._isAttached;
}
function shouldAttach(view) {
  if (!shouldTriggerAttach(view)) {
    return false;
  }
  view._isAttached = true;
  return true;
}
function shouldTriggerDetach(view) {
  return view._isAttached;
}
function shouldDetach(view) {
  if (!shouldTriggerDetach(view)) {
    return false;
  }
  view._isAttached = false;
  return true;
}
function triggerDOMRefresh(view) {
  if (view._isAttached && view._isRendered) {
    view.triggerMethod("dom:refresh", view);
  }
}
function triggerDOMRemove(view) {
  if (view._isAttached && view._isRendered) {
    view.triggerMethod("dom:remove", view);
  }
}
function handleBeforeAttach() {
  triggerMethodChildren(this, "before:attach", shouldTriggerAttach);
}
function handleAttach() {
  triggerMethodChildren(this, "attach", shouldAttach);
  triggerDOMRefresh(this);
}
function handleBeforeDetach() {
  triggerMethodChildren(this, "before:detach", shouldTriggerDetach);
  triggerDOMRemove(this);
}
function handleDetach() {
  triggerMethodChildren(this, "detach", shouldDetach);
}
function handleBeforeRender() {
  triggerDOMRemove(this);
}
function handleRender() {
  triggerDOMRefresh(this);
}
const monitorViewEvents = function (view) {
  if (view._areViewEventsMonitored || view.monitorViewEvents === false) {
    return;
  }
  view._areViewEventsMonitored = true;
  view.on({
    "before:attach": handleBeforeAttach,
    attach: handleAttach,
    "before:detach": handleBeforeDetach,
    detach: handleDetach,
    "before:render": handleBeforeRender,
    render: handleRender
  });
};

// Trigger Method
const triggerMethod$1 = (function () {
  // split the event name on the ":"
  const splitter = /(^|:)(\w)/gi;
  // Only calc getOnMethodName once
  const methodCache = {};
  // take the event section ("section1:section2:section3")
  // and turn it in to uppercase name onSection1Section2Section3
  function getEventName(match, prefix, eventName) {
    return eventName.toUpperCase();
  }
  const getOnMethodName = function (event) {
    if (!methodCache[event]) {
      methodCache[event] = "on" + event.replace(splitter, getEventName);
    }
    return methodCache[event];
  };
  return function triggerMethod(event, ...args) {
    // get the method name from the event name
    const methodName = getOnMethodName(event);
    const method = getOptions.call(this, methodName);
    let result;
    // call the onMethodName if it exists
    if (_.isFunction(method)) {
      // pass all args, except the event name
      result = method.apply(this, args);
    }
    // trigger the event
    this.trigger.apply(this, arguments);
    return result;
  };
})();

const _routeToRegExp = (function () {
  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  const optionalParam = /\((.*?)\)/g;
  const namedParam = /(\(\?)?:\w+/g;
  const splatParam = /\*\w+/g;
  const escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
  return function (route) {
    route = route
      .replace(escapeRegExp, "\\$&")
      .replace(optionalParam, "(?:$1)?")
      .replace(namedParam, function (match, optional) {
        return optional ? match : "([^/?]+)";
      })
      .replace(splatParam, "([^?]*?)");
    return new RegExp("^" + route + "(?:\\?([\\s\\S]*))?$");
  };
})();

// BrowserHistory
class BrowserHistory {
  constructor() {
    this.handlers = [];
    // Ensure that `BrowserHistory` can be used outside of the browser.
    if (typeof window !== "undefined") {
      this.location = window.location;
      this.history = window.history;
    }
    this.checkUrl = this.checkUrl.bind(this);
  }
  static getInstance() {
    if (!BrowserHistory.instance) {
      BrowserHistory.instance = new BrowserHistory();
    }
    return BrowserHistory.instance;
  }
}
// Has the history handling already been started?
BrowserHistory.started = false;
const BrowserHistoryProto = BrowserHistory.prototype;
BrowserHistoryProto.interval = 50;
BrowserHistoryProto.atRoot = function () {
  const path = this.location.pathname.replace(/[^\/]$/, "$&/");
  return path === this.root && !this.getSearch();
};
BrowserHistoryProto.matchRoot = function () {
  const path = this.decodeFragment(this.location.pathname);
  const rootPath = path.slice(0, this.root.length - 1) + "/";
  return rootPath === this.root;
};
BrowserHistoryProto.decodeFragment = function (fragment) {
  return decodeURI(fragment.replace(/%25/g, "%2525"));
};
BrowserHistoryProto.getSearch = function () {
  const match = this.location.href.replace(/#.*/, "").match(/\?.+/);
  return match ? match[0] : "";
};
BrowserHistoryProto.getHash = function () {
  const match = (window || this).location.href.match(/#(.*)$/);
  return match ? match[1] : "";
};
BrowserHistoryProto.getPath = function () {
  const path = this.decodeFragment(
    this.location.pathname + this.getSearch()
  ).slice(this.root.length - 1);
  return path.charAt(0) === "/" ? path.slice(1) : path;
};
BrowserHistoryProto.getFragment = function (fragment) {
  // Cached regex for stripping a leading hash/slash and trailing space.
  const routeStripper = /^[#\/]|\s+$/g;
  if (fragment == null) {
    if (this._usePushState || !this._wantsHashChange) {
      fragment = this.getPath();
    } else {
      fragment = this.getHash();
    }
  }
  return fragment.replace(routeStripper, "");
};
BrowserHistoryProto.start = function (options) {
  if (BrowserHistory.started) {
    throw new Error("BrowserHistory has already been started");
  }
  BrowserHistory.started = true;
  // Cached regex for stripping leading and trailing slashes.
  const rootStripper = /^\/+|\/+$/g;
  this._hashes = this._hashes || [];
  this._checkDefaultHash();
  // Figure out the initial configuration. Do we need an iframe?
  // Is pushState desired ... is it available?
  this.options = Object.assign({ root: "/" }, this.options, options);
  this.root = this.options.root;
  this._wantsHashChange = this.options.hashChange !== false;
  this._hasHashChange =
    "onhashchange" in window &&
    (document["documentMode"] === void 0 || document["documentMode"] > 7);
  this._useHashChange = this._wantsHashChange && this._hasHashChange;
  this._wantsPushState = !!this.options.pushState;
  this._hasPushState = !!(this.history && this.history.pushState);
  this._usePushState = this._wantsPushState && this._hasPushState;
  this.fragment = this.getFragment();
  // Normalize root to always include a leading and trailing slash.
  this.root = ("/" + this.root + "/").replace(rootStripper, "/");
  // Transition from hashChange to pushState or vice versa if both are
  // requested.
  if (this._wantsHashChange && this._wantsPushState) {
    // If we've started off with a route from a `pushState`-enabled
    // browser, but we're currently in a browser that doesn't support it...
    if (!this._hasPushState && !this.atRoot()) {
      var rootPath = this.root.slice(0, -1) || "/";
      this.location.replace(rootPath + "#" + this.getPath());
      // Return immediately as browser will do redirect to new url
      return true;
      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
    } else if (this._hasPushState && this.atRoot()) {
      this.navigate(this.getHash(), { replace: true });
    }
  }
  // Proxy an iframe to handle location events if the browser doesn't
  // support the `hashchange` event, HTML5 history, or the user wants
  // `hashChange` but not `pushState`.
  if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
    this.iframe = document.createElement("iframe");
    this.iframe.src = "javascript:0";
    this.iframe.style.display = "none";
    this.iframe.tabIndex = -1;
    var body = document.body;
    // Using `appendChild` will throw on IE < 9 if the document is not ready.
    var iWindow = body.insertBefore(this.iframe, body.firstChild).contentWindow;
    iWindow.document.open();
    iWindow.document.close();
    iWindow.location.hash = "#" + this.fragment;
  }
  const addEventListener = window.addEventListener;
  // Depending on whether we're using pushState or hashes, and whether
  // 'onhashchange' is supported, determine how we check the URL state.
  if (this._usePushState) {
    addEventListener("popstate", this.checkUrl, false);
  } else if (this._useHashChange && !this.iframe) {
    addEventListener("hashchange", this.checkUrl, false);
  } else if (this._wantsHashChange) {
    this._checkUrlInterval = window.setInterval(this.checkUrl, this.interval);
  }
  if (!this.options.silent) {
    return this.loadUrl();
  }
};
BrowserHistoryProto.stop = function () {
  const removeEventListener = window.removeEventListener;
  // Remove window listeners.
  if (this._usePushState) {
    removeEventListener("popstate", this.checkUrl, false);
  } else if (this._useHashChange && !this.iframe) {
    removeEventListener("hashchange", this.checkUrl, false);
  }
  // Clean up the iframe if necessary.
  if (this.iframe) {
    document.body.removeChild(this.iframe);
    this.iframe = null;
  }
  // Some environments will throw when clearing an undefined interval.
  if (this._checkUrlInterval) {
    window.clearInterval(this._checkUrlInterval);
  }
  BrowserHistory.started = false;
};
BrowserHistoryProto.route = function (route, callback) {
  this.handlers.unshift({ route: route, callback: callback });
};
BrowserHistoryProto.checkUrl = function () {
  let current = this.getFragment();
  // If the user pressed the back button, the iframe's hash will have
  // changed and we should use that for comparison.
  if (current === this.fragment && this.iframe) {
    current = this.getHash(this.iframe.contentWindow);
  }
  if (current === this.fragment) return false;
  if (this.iframe) this.navigate(current);
  this.loadUrl();
};
BrowserHistoryProto.loadUrl = function (fragmentOverride) {
  // If the root doesn't match, no routes can match either.
  if (!this.matchRoot()) return false;
  const fragment = (this.fragment = this.getFragment(fragmentOverride));
  return this.handlers.some((handler) => {
    if (handler.route.test(fragment)) {
      handler.callback(fragment);
      return true;
    }
  });
};
BrowserHistoryProto.navigate = function (fragment, options) {
  if (!BrowserHistory.started) {
    return false;
  }
  const pathStripper = /#.*$/;
  if (!options || options === true) {
    options = { trigger: !!options };
  }
  // Normalize the fragment.
  fragment = this.getFragment(fragment || "");
  // Don't include a trailing slash on the root.
  var rootPath = this.root;
  if (fragment === "" || fragment.charAt(0) === "?") {
    rootPath = rootPath.slice(0, -1) || "/";
  }
  var url = rootPath + fragment;
  // Strip the hash and decode for matching.
  fragment = this.decodeFragment(fragment.replace(pathStripper, ""));
  if (this.fragment === fragment) {
    return;
  }
  this.fragment = fragment;
  // If pushState is available, we use it to set the fragment as a real URL.
  if (this._usePushState) {
    this.history[options.replace ? "replaceState" : "pushState"](
      {},
      document.title,
      url
    );
    // If hash changes haven't been explicitly disabled, update the hash
    // fragment to store history.
  } else if (this._wantsHashChange) {
    this._updateHash(this.location, fragment, options.replace);
    if (this.iframe && fragment !== this.getHash(this.iframe.contentWindow)) {
      var iWindow = this.iframe.contentWindow;
      // Opening and closing the iframe tricks IE7 and earlier to push a
      // history entry on hash-tag change.  When replace is true, we don't
      // want this.
      if (!options.replace) {
        iWindow.document.open();
        iWindow.document.close();
      }
      this._updateHash(iWindow.location, fragment, options.replace);
    }
    // If you've told us that you explicitly don't want fallback hashchange-
    // based history, then `navigate` becomes a page refresh.
  } else {
    return this.location.assign(url);
  }
  if (options.trigger) {
    return this.loadUrl(fragment);
  }
};
BrowserHistoryProto._updateHash = function (location, fragment, replace) {
  if (replace) {
    var href = location.href.replace(/(javascript:|#).*$/, "");
    location.replace(href + "#" + fragment);
  } else {
    // Some browsers require that `hash` contains a leading #.
    location.hash = "#" + fragment;
  }
};
BrowserHistoryProto._subscribeToEvents = function () {
  window.addEventListener("hashchange", () => {
    this._hashChanged();
  });
};
BrowserHistoryProto._hashChanged = function () {
  const hash = this.getHash();
  if (this.options.validateHash) {
    var _isHashInRoutes = this._isHashInRoutes(hash);
    if (_isHashInRoutes) {
      this._addHash(hash);
    }
  } else {
    this._addHash(hash);
  }
};
BrowserHistoryProto._checkDefaultHash = function () {
  const hash = this.getHash();
  if (hash) {
    this._addHash(hash);
  }
};
BrowserHistoryProto._isHashInRoutes = function (hash) {
  const handlers = this.handlers;
  let isExist = false;
  for (var i = 0, len = handlers.length; i < len; i++) {
    let handler = handlers[i];
    if (handler.route.toString() === _routeToRegExp(hash).toString()) {
      isExist = true;
      break;
    }
  }
  return isExist;
};
BrowserHistoryProto.getPreviousHash = function () {
  if (!BrowserHistory.started) {
    throw "BrowserHistory has not been started";
  }
  const _hashes = this._hashes || [];
  return _hashes[0] || "";
};
Object.assign(BrowserHistory.prototype, EventMixin);
const BrowserHistoryInstance = BrowserHistory.getInstance();

const _setOptions = function (options, classOptions) {
  this.options = Object.assign({}, _.result(this, "options"), options);
  this.mergeOptions(options, classOptions);
};

// Router
class Router {
  constructor(options) {
    if (!options) {
      options = {};
    }
    this._setOptions(options, ["appRoutes", "controller"]);
    if (options.routes) {
      this.routes = options.routes;
    }
    this._bindRoutes();
    this.initialize.apply(this, arguments);
    const appRoutes = this.appRoutes;
    const controller = this._getController();
    this.processAppRoutes(controller, appRoutes);
    this.on("route", this._processOnRoute, this);
  }
}
Router.extend = function (protoProps) {
  const Parent = this;
  let classProperties = {};
  for (let prop in protoProps) {
    if (typeof protoProps[prop] !== "function") {
      classProperties[prop] = protoProps[prop];
    }
  }
  class extendedRouter extends Parent {
    constructor(options) {
      Object.assign(classProperties, options);
      super(classProperties);
    }
  }
  // Set a convenience property in case the parent"s prototype is needed later.
  extendedRouter.__super__ = Parent.prototype;
  // Add static properties to the constructor function, if supplied.
  Object.assign(extendedRouter, Parent);
  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function and add the prototype properties.
  Object.assign(extendedRouter.prototype, Parent.prototype, protoProps);
  extendedRouter.prototype.constructor = extendedRouter;
  return extendedRouter;
};
const RouterProto = Router.prototype;
Object.assign(Router.prototype, EventMixin, {
  _bindEvents,
  _unbindEvents,
  triggerMethod: triggerMethod$1,
  normalizeMethods: normalizeMethods$1,
  getOptions,
  _setOptions,
  mergeOptions: mergeOptions$1,
  initialize() {}
});
RouterProto.execute = function (callback, args, name) {
  if (!_.isFunction(callback)) {
    return false;
  }
  if (callback) callback.apply(this, args);
};
RouterProto.navigate = function (fragment, options) {
  BrowserHistoryInstance.navigate(fragment, options);
  return this;
};
RouterProto._extractParameters = function (route, fragment) {
  route.exec(fragment);
  var params = route.exec(fragment).slice(1);
  return params.map((param, i) => {
    // Don't decode the search params.
    if (i === params.length - 1) return param || null;
    return param ? decodeURIComponent(param) : null;
  });
};
RouterProto._routeToRegExp = _routeToRegExp;
RouterProto.route = function (route, name, callback) {
  const regexRoute = _.isRegExp(route) ? route : this._routeToRegExp(route);
  if (_.isFunction(name)) {
    callback = name;
    name = "";
  }
  if (!callback) {
    callback = this[name];
  }
  var router = this;
  BrowserHistoryInstance.route(regexRoute, function (fragment) {
    var args = router._extractParameters(regexRoute, fragment);
    if (router.execute(callback, args, name) !== false) {
      router.trigger.apply(router, ["route:" + name].concat(args));
      router.trigger("route", name, args);
      BrowserHistoryInstance.trigger("route", router, name, args);
    }
  });
  return this;
};
RouterProto._bindRoutes = function () {
  if (!this.routes) return;
  this.routes = _.result(this, "routes");
  var route,
    routes = Object.keys(this.routes);
  while ((route = routes.pop()) != null) {
    this.route(route, this.routes[route]);
  }
};
RouterProto.appRoute = function (route, methodName) {
  const controller = this._getController();
  this._addAppRoute(controller, route, methodName);
  return this;
};
RouterProto._getController = function () {
  return this.controller;
};
RouterProto._processOnRoute = function (routeName, routeArgs) {
  // make sure an onRoute before trying to call it
  if (_.isFunction(this.onRoute)) {
    // find the path that matches the current route
    const routePath = _.invert(this.appRoutes)[routeName];
    this.onRoute(routeName, routePath, routeArgs);
  }
};
RouterProto.processAppRoutes = function (controller, appRoutes) {
  if (!appRoutes) {
    return this;
  }
  const routeNames = Object.keys(appRoutes).reverse(); // Backbone requires reverted order of routes
  routeNames.forEach((route) => {
    this._addAppRoute(controller, route, appRoutes[route]);
  });
  return this;
};
RouterProto._addAppRoute = function (controller, route, methodName) {
  const method = controller[methodName];
  if (!method) {
    throw new Error(`Method "${methodName}" was not found on the controller`);
  }
  this.route(route, methodName, method.bind(controller));
};

// Backbone.Radio v2.0.0
const Radio = {
  DEBUG: false,
  _debugText(warning, eventName, channelName) {
    return (
      warning +
      (channelName ? " on the " + channelName + " channel" : "") +
      ': "' +
      eventName +
      '"'
    );
  },
  debugLog(warning, eventName, channelName) {
    if (this.DEBUG && console && console.warn) {
      console.warn(this._debugText(warning, eventName, channelName));
    }
  }
};
Radio._eventsApi = function (obj, action, name, rest) {
  if (!name) {
    return false;
  }
  const eventSplitter = /\s+/;
  const _typeof =
    typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
      ? function (obj) {
          return typeof obj;
        }
      : function (obj) {
          return obj &&
            typeof Symbol === "function" &&
            obj.constructor === Symbol
            ? "symbol"
            : typeof obj;
        };
  var results = {};
  // Handle event maps.
  if (
    (typeof name === "undefined" ? "undefined" : _typeof(name)) === "object"
  ) {
    for (var key in name) {
      var result = obj[action].apply(obj, [key, name[key]].concat(rest));
      eventSplitter.test(key)
        ? Object.assign(results, result)
        : (results[key] = result);
    }
    return results;
  }
  // Handle space separated event names.
  if (eventSplitter.test(name)) {
    var names = name.split(eventSplitter);
    for (var i = 0, l = names.length; i < l; i++) {
      results[names[i]] = obj[action].apply(obj, [names[i]].concat(rest));
    }
    return results;
  }
  return false;
};
Radio._callHandler = function (callback, context, args) {
  var a1 = args[0],
    a2 = args[1],
    a3 = args[2];
  switch (args.length) {
    case 0:
      return callback.call(context);
    case 1:
      return callback.call(context, a1);
    case 2:
      return callback.call(context, a1, a2);
    case 3:
      return callback.call(context, a1, a2, a3);
    default:
      return callback.apply(context, args);
  }
};
/*
 * tune-in
 * -------
 * Get console logs of a channel's activity
 *
 */
var _logs = {};
Radio.log = function log(channelName, eventName) {
  if (typeof console === "undefined") {
    return;
  }
  var args = _.toArray(arguments).slice(2);
  console.log("[" + channelName + '] "' + eventName + '"', args);
};
Object.assign(
  Radio,
  (function () {
    // This is to produce an identical function in both tuneIn and tuneOut,
    // so that Backbone.Events unregisters it.
    function _partial(channelName) {
      return (
        _logs[channelName] ||
        (_logs[channelName] = Radio.log.bind(Radio, channelName))
      );
    }
    return {
      tuneIn: function (channelName) {
        var channel = this.channel(channelName);
        channel._tunedIn = true;
        channel.on("all", _partial(channelName));
        return this;
      },
      tuneOut: function (channelName) {
        var channel = this.channel(channelName);
        channel._tunedIn = false;
        channel.off("all", _partial(channelName));
        delete _logs[channelName];
        return this;
      }
    };
  })()
);
Radio._channels = {};
Radio.channel = function (channelName) {
  if (!channelName) {
    throw new Error("You must provide a name for the channel.");
  }
  if (this._channels[channelName]) {
    return this._channels[channelName];
  } else {
    return (this._channels[channelName] = new Channel(channelName));
  }
};
const Requests = {};
Object.assign(
  Requests,
  (function () {
    function makeCallback(callback) {
      return _.isFunction(callback)
        ? callback
        : function () {
            return callback;
          };
    }
    // A helper used by `off` methods to the handler from the store
    function removeHandler(store, name, callback, context) {
      var event = store[name];
      if (
        (!callback ||
          callback === event.callback ||
          callback === event.callback._callback) &&
        (!context || context === event.context)
      ) {
        delete store[name];
        return true;
      }
    }
    function removeHandlers(store = {}, name, callback, context) {
      var names = name ? [name] : Object.keys(store);
      var matched = false;
      for (let i = 0, length = names.length; i < length; i++) {
        name = names[i];
        // If there's no event by this name, log it and continue
        // with the loop
        if (!store[name]) {
          continue;
        }
        if (removeHandler(store, name, callback, context)) {
          matched = true;
        }
      }
      return matched;
    }
    return {
      // Make a request
      request: function request(name) {
        var args = _.toArray(arguments).slice(1);
        var results = Radio._eventsApi(this, "request", name, args);
        if (results) {
          return results;
        }
        var channelName = this.channelName;
        var requests = this._requests;
        // Check if we should log the request, and if so, do it
        if (channelName && this._tunedIn) {
          Radio.log.apply(this, [channelName, name].concat(args));
        }
        // If the request isn"t handled, log it in DEBUG mode and exit
        if (requests && (requests[name] || requests["default"])) {
          var handler = requests[name] || requests["default"];
          args = requests[name] ? args : _.toArray(arguments);
          return Radio._callHandler(handler.callback, handler.context, args);
        } else {
          Radio.debugLog("An unhandled request was fired", name, channelName);
        }
      },
      // Set up a handler for a request
      reply: function reply(name, callback, context) {
        if (Radio._eventsApi(this, "reply", name, [callback, context])) {
          return this;
        }
        this._requests || (this._requests = {});
        if (this._requests[name]) {
          Radio.debugLog("A request was overwritten", name, this.channelName);
        }
        this._requests[name] = {
          callback: makeCallback(callback),
          context: context || this
        };
        return this;
      },
      // Set up a handler that can only be requested once
      replyOnce: function replyOnce(name, callback, context) {
        if (Radio._eventsApi(this, "replyOnce", name, [callback, context])) {
          return this;
        }
        var self = this;
        var once = once(function () {
          self.stopReplying(name);
          return makeCallback(callback).apply(this, arguments);
        });
        return this.reply(name, once, context);
      },
      // Remove handler(s)
      stopReplying: function stopReplying(name, callback, context) {
        if (Radio._eventsApi(this, "stopReplying", name)) {
          return this;
        }
        // Remove everything if there are no arguments passed
        if (!name && !callback && !context) {
          delete this._requests;
        } else if (!removeHandlers(this._requests, name, callback, context)) {
          Radio.debugLog(
            "Attempted to remove the unregistered request",
            name,
            this.channelName
          );
        }
        return this;
      }
    };
  })()
);
Radio.Requests = Requests;
class Channel {
  // A Channel is an object that extends from Backbone.Events,
  // and Radio.Requests.
  constructor(channelName) {
    this.channelName = channelName;
  }
}
Object.assign(Channel.prototype, EventMixin, Requests, {
  reset: function () {
    this.off();
    this.stopListening();
    this.stopReplying();
    return this;
  }
});
Radio.reset = function (channelName) {
  var channels = !channelName
    ? this._channels
    : { channelName: this._channels[channelName] };
  _.each(channels, function (channel) {
    channel.reset();
  });
};
Object.assign(Radio, EventMixin, Requests);

const CommonMixin = Object.assign(EventMixin, {
  // Imports the "normalizeMethods" to transform hashes of
  // events=>function references/names to a hash of events=>function references
  normalizeMethods: normalizeMethods$1,
  _setOptions,
  // A handy way to merge passed-in options onto the instance
  mergeOptions: mergeOptions$1,
  // Enable getting options from this or this.options by name.
  getOption: getOptions,
  // Enable binding view's events from another entity.
  bindEvents: _bindEvents,
  // Enable unbinding view's events from another entity.
  unbindEvents: _unbindEvents,
  // Enable binding view's requests.
  bindRequests: _bindRequests,
  // Enable unbinding view's requests.
  unbindRequests: _unbindRequests,
  triggerMethod: triggerMethod$1
});

const DestroyMixin = {
  _isDestroyed: false,
  isDestroyed() {
    return this._isDestroyed;
  },
  destroy(options) {
    if (this._isDestroyed) {
      return this;
    }
    this.triggerMethod("before:destroy", this, options);
    this._isDestroyed = true;
    this.triggerMethod("destroy", this, options);
    this.stopListening();
    return this;
  }
};

const RadioMixin = {
  _initRadio() {
    const channelName = _.result(this, "channelName");
    if (!channelName) {
      return;
    }
    /* istanbul ignore next */
    if (!Radio) {
      throw new MnError({
        message: "The dependency 'Radio' is missing."
      });
    }
    const channel = (this._channel = Radio.channel(channelName));
    const radioEvents = _.result(this, "radioEvents");
    this.bindEvents(channel, radioEvents);
    const radioRequests = _.result(this, "radioRequests");
    this.bindRequests(channel, radioRequests);
    this.on("destroy", this._destroyRadio);
  },
  _destroyRadio() {
    this._channel.stopReplying(null, null, this);
  },
  getChannel() {
    return this._channel;
  }
};

/**
 * -------------
 * Manager
 * previously named "Object" | MnObject in Backbone.Marionette
 * `Manager`is a better name since more explicit and manifest : an object totally unbound of the DOM which serves as organizer between the components
 */
// Manager borrows many conventions and utilities from Marionette.
class Manager {
  constructor(options) {
    this._setOptions(options, ["channelName", "radioEvents", "radioRequests"]);
    this.cid = _.uniqueId(this.cidPrefix);
    this._initRadio();
    this.initialize.apply(this, arguments);
  }
}
Manager.extend = function (protoProps) {
  const Parent = this;
  let classProperties = {};
  for (let prop in protoProps) {
    if (typeof protoProps[prop] !== "function") {
      classProperties[prop] = protoProps[prop];
    }
  }
  class ExtendedManager extends Parent {
    constructor(options = {}) {
      Object.assign(classProperties, options);
      super(classProperties);
    }
  }
  // Set a convenience property in case the parent"s prototype is needed later.
  ExtendedManager.__super__ = Parent.prototype;
  // Add static properties to the constructor function, if supplied.
  Object.assign(ExtendedManager, Parent);
  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function and add the prototype properties.
  Object.assign(ExtendedManager.prototype, Parent.prototype, protoProps);
  ExtendedManager.prototype.constructor = ExtendedManager;
  return ExtendedManager;
};
// Object Methods
// --------------
let MarionetteObjectProto = Manager.prototype;
Object.assign(Manager.prototype, CommonMixin, DestroyMixin, RadioMixin);
MarionetteObjectProto.cidPrefix = "mno";
MarionetteObjectProto.initialize = function () {};

const getNamespacedEventName = (function () {
  const delegateEventSplitter = /^(\S+)\s*(.*)$/;
  return function (eventName, namespace) {
    const match = eventName.match(delegateEventSplitter);
    return `${match[1]}.${namespace} ${match[2]}`;
  };
})();
const _invoke = _.invokeMap || _.invoke;

const BehaviorsMixin = (function () {
  // Takes care of getting the behavior class
  // given options and a key.
  // If a user passes in options.behaviorClass
  // default to using that.
  // If a user passes in a Behavior Class directly, use that
  // Otherwise an error is thrown
  function getBehaviorClass(options) {
    if (options.behaviorClass) {
      return { BehaviorClass: options.behaviorClass, options };
    }
    //treat functions as a Behavior constructor
    if (_.isFunction(options)) {
      return { BehaviorClass: options, options: {} };
    }
    throw new MnError({
      message:
        "Unable to get behavior class. A Behavior constructor should be passed directly or as behaviorClass property of options",
      url: "marionette.behavior.html#defining-and-attaching-behaviors"
    });
  }
  // Iterate over the behaviors object, for each behavior
  // instantiate it and get its grouped behaviors.
  // This accepts a list of behaviors in either an object or array form
  function parseBehaviors(view, behaviors, allBehaviors) {
    // TODO: precise the view, behaviors and allBehaviors parameters.
    return behaviors.reduce((reducedBehaviors, behaviorDefiniton) => {
      const { BehaviorClass, options } = getBehaviorClass(behaviorDefiniton);
      const behavior = new BehaviorClass(options, view);
      reducedBehaviors.push(behavior);
      const _childBehaviors = _.result(behavior, "behaviors");
      return _childBehaviors
        ? parseBehaviors(view, _childBehaviors, reducedBehaviors)
        : reducedBehaviors;
    }, allBehaviors);
  }
  return {
    _initBehaviors() {
      const _behaviors = _.result(this, "behaviors");
      this._behaviors = _behaviors ? parseBehaviors(this, _behaviors, []) : [];
    },
    _getBehaviorTriggers() {
      const triggers = _invoke(this._behaviors, "_getTriggers");
      return triggers.reduce((memo, _triggers) => {
        return Object.assign(memo, _triggers);
      }, {});
    },
    _getBehaviorEvents() {
      const events = _invoke(this._behaviors, "_getEvents");
      return events.reduce((memo, _events) => {
        return Object.assign(memo, _events);
      }, {});
    },
    // proxy behavior $el to the view's $el.
    _proxyBehaviorViewProperties() {
      _invoke(this._behaviors, "proxyViewProperties");
    },
    // delegate modelEvents and collectionEvents
    _delegateBehaviorEntityEvents() {
      _invoke(this._behaviors, "delegateEntityEvents");
    },
    // undelegate modelEvents and collectionEvents
    _undelegateBehaviorEntityEvents() {
      _invoke(this._behaviors, "undelegateEntityEvents");
    },
    _destroyBehaviors(options) {
      // Call destroy on each behavior after
      // destroying the view.
      // This unbinds event listeners
      // that behaviors have registered for.
      _invoke(this._behaviors, "destroy", options);
    },
    // Remove a behavior
    _removeBehavior(behavior) {
      // Don"t worry about the clean up if the view is destroyed
      if (this._isDestroyed) {
        return;
      }
      // Remove behavior-only triggers and events
      this.undelegate(`.trig${behavior.cid} .${behavior.cid}`);
      this._behaviors = _.without(this._behaviors, behavior);
    },
    _bindBehaviorUIElements() {
      _invoke(this._behaviors, "bindUIElements");
    },
    _unbindBehaviorUIElements() {
      _invoke(this._behaviors, "unbindUIElements");
    },
    _triggerEventOnBehaviors(eventName, view, options) {
      _invoke(this._behaviors, "triggerMethod", eventName, view, options);
    }
  };
})();

const DelegateEntityEventsMixin = {
  // Handle `modelEvents`, and `collectionEvents` configuration
  _delegateEntityEvents(model, collection) {
    if (model) {
      this._modelEvents = _.result(this, "modelEvents");
      this.bindEvents(model, this._modelEvents);
    }
    if (collection) {
      this._collectionEvents = _.result(this, "collectionEvents");
      this.bindEvents(collection, this._collectionEvents);
    }
  },
  // Remove any previously delegate entity events
  _undelegateEntityEvents(model, collection) {
    if (this._modelEvents) {
      this.unbindEvents(model, this._modelEvents);
      delete this._modelEvents;
    }
    if (this._collectionEvents) {
      this.unbindEvents(collection, this._collectionEvents);
      delete this._collectionEvents;
    }
  },
  // Remove cached event handlers
  _deleteEntityEventHandlers() {
    delete this._modelEvents;
    delete this._collectionEvents;
  }
};

const TemplateRenderMixin = {
  template: false,
  // Internal method to render the template with the serialized data
  // and template context
  _renderTemplate(template) {
    // Add in entity data and template context
    const data = this.mixinTemplateContext(this.serializeData()) || {};
    // Render and add to el
    const html = this._renderHtml(template, data);
    if (typeof html !== "undefined") {
      this.attachElContent(html);
    }
  },
  // Get the template for this view instance.
  // You can set a `template` attribute in the view definition
  // or pass a `template: TemplateFunction` parameter in
  // to the constructor options.
  getTemplate() {
    return this.template;
  },
  // Mix in template context methods. Looks for a
  // `templateContext` attribute, which can either be an
  // object literal, or a function that returns an object
  // literal. All methods and attributes from this object
  // are copies to the object passed in.
  mixinTemplateContext(serializedData) {
    const templateContext = _.result(this, "templateContext");
    if (!templateContext) {
      return serializedData;
    }
    if (!serializedData) {
      return templateContext;
    }
    return Object.assign({}, serializedData, templateContext);
  },
  // Serialize the view's model *or* collection, if
  // it exists, for the template
  serializeData() {
    // If we have a model, we serialize that
    if (this.model) {
      return this.serializeModel();
    }
    // Otherwise, we serialize the collection,
    // making it available under the `items` property
    if (this.collection) {
      return {
        items: this.serializeCollection()
      };
    }
  },
  // Prepares the special `model` property of a view
  // for being displayed in the template. Override this if
  // you need a custom transformation for your view's model
  serializeModel() {
    return this.model.attributes;
  },
  // Serialize a collection
  serializeCollection() {
    return this.collection.models.map(function (model) {
      return model.attributes;
    });
  },
  outRender: true,
  elTree: false,
  // Renders the data into the template
  _renderHtml(template, data) {
    // there, snabbdom
    // return template(data);
    const newTree = template.call(this, data, VDom.h)[0];
    let rootTag;
    if (this.outRender) {
      rootTag = newTree.sel;
    } else {
      rootTag = this.tagName;
    }
    if (!this.elTree) {
      // First render, this.elTree is not initialized
      const emptyTree = VDom.vnode(rootTag, {}, [], undefined, this.el);
      VDom.patch(emptyTree, newTree);
      // empty vtree on destroy to ensure hooks gets called
      this.on("destroy", () => {
        VDom.patch(
          this.elTree,
          VDom.vnode(rootTag, {}, [], undefined, this.el)
        );
      });
    } else {
      VDom.patch(this.elTree, newTree);
    }
    this.elTree = newTree;
  },
  // Attaches the content of a given view.
  // This method can be overridden to optimize rendering,
  // or to render in a non standard way.
  //
  // For example, using `innerHTML` instead of `$el.html`
  //
  // ```js
  // attachElContent(html) {
  //   this.el.innerHTML = html;
  // }
  // ```
  attachElContent(html) {
    this.Dom.setContents(this.el, html, this.$el);
  }
};

// Add Feature flags here
// e.g. 'class' => false
const FEATURES = {
  childViewEventPrefix: false,
  triggersStopPropagation: true,
  triggersPreventDefault: true,
  DEV_MODE: false
};
const isEnabled = function (name) {
  return !!FEATURES[name];
};

const TriggersMixin = (function () {
  // Internal method to create an event handler for a given `triggerDef` like
  // "click:foo"
  function buildViewTrigger(view, triggerDef) {
    if (_.isString(triggerDef)) {
      triggerDef = { event: triggerDef };
    }
    const eventName = triggerDef.event;
    let shouldPreventDefault = !!triggerDef.preventDefault;
    if (isEnabled("triggersPreventDefault")) {
      shouldPreventDefault = triggerDef.preventDefault !== false;
    }
    let shouldStopPropagation = !!triggerDef.stopPropagation;
    if (isEnabled("triggersStopPropagation")) {
      shouldStopPropagation = triggerDef.stopPropagation !== false;
    }
    return function (event, ...args) {
      if (shouldPreventDefault) {
        event.preventDefault();
      }
      if (shouldStopPropagation) {
        event.stopPropagation();
      }
      view.triggerMethod(eventName, view, event, ...args);
    };
  }
  return {
    // Configure `triggers` to forward DOM events to view
    // events. `triggers: {"click .foo": "do:foo"}`
    _getViewTriggers(view, triggers) {
      // Configure the triggers, prevent default
      // action and stop propagation of DOM events
      return _.reduce(
        triggers,
        (events, value, key) => {
          key = getNamespacedEventName(key, `trig${this.cid}`);
          events[key] = buildViewTrigger(view, value);
          return events;
        },
        {}
      );
    }
  };
})();

const ElementMixin = {
  // The default `tagName` of a View's element is `"div"`.
  tagName: "div",
  $: function (selector) {
    return this.$el.find(selector);
  },
  /*

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Events listeners.
    remove: function () {
      this._removeElement();
      this.stopListening();
      return this;
    },

    // Remove this view's element from the document and all event listeners
    // attached to it. Exposed for subclasses using an alternative DOM
    // manipulation API.
    _removeElement: function () {
      this.$el.remove();
    },

   */
  _ensureElement() {
    if (!this.el) {
      var attrs = Object.assign({}, _.result(this, "attributes"));
      if (this.id) attrs["id"] = _.result(this, "id");
      if (this.className) attrs["class"] = _.result(this, "className");
      this.setElement(this._createElement(_.result(this, "tagName")));
      this._setAttributes(attrs);
    } else {
      this.setElement(_.result(this, "el"));
    }
  },
  // Handle destroying the view and its children.
  destroy(options) {
    if (this._isDestroyed) {
      return this;
    }
    const shouldTriggerDetach = this._isAttached && !this._disableDetachEvents;
    this.triggerMethod("before:destroy", this, options);
    if (shouldTriggerDetach) {
      this.triggerMethod("before:detach", this);
    }
    // unbind UI elements
    this.unbindUIElements();
    // remove the view from the DOM
    this._removeElement();
    if (shouldTriggerDetach) {
      this._isAttached = false;
      this.triggerMethod("detach", this);
    }
    // remove children after the remove to prevent extra paints
    this._removeChildren();
    this._isDestroyed = true;
    this._isRendered = false;
    // Destroy behaviors after _isDestroyed flag
    this._destroyBehaviors(options);
    this._deleteEntityEventHandlers();
    this.triggerMethod("destroy", this, options);
    this._triggerEventOnBehaviors("destroy", this, options);
    this.stopListening();
    return this;
  },
  _removeElement() {
    this.$el.off();
    this.Dom.detachEl(this.el, this.$el);
  }
};

const UIMixin = (function () {
  const uiRegEx = /@ui\.[a-zA-Z-_$0-9]*/g;
  // allows for the use of the @ui. syntax within
  // a given key for triggers and events
  // swaps the @ui with the associated selector.
  // Returns a new, non-mutated, parsed events hash.
  const _normalizeUIKeys = function (hash, ui) {
    return _.reduce(
      hash,
      (memo, val, key) => {
        const normalizedKey = _normalizeUIString(key, ui);
        memo[normalizedKey] = val;
        return memo;
      },
      {}
    );
  };
  // utility method for parsing @ui. syntax strings
  // into associated selector
  const _normalizeUIString = function (uiString, ui) {
    return uiString.replace(uiRegEx, (r) => {
      return ui[r.slice(4)];
    });
  };
  // allows for the use of the @ui. syntax within
  // a given value for regions
  // swaps the @ui with the associated selector
  const _normalizeUIValues = function (hash, ui, property) {
    _.each(hash, (val, key) => {
      if (_.isString(val)) {
        hash[key] = _normalizeUIString(val, ui);
      } else if (val) {
        const propertyVal = val[property];
        if (_.isString(propertyVal)) {
          val[property] = _normalizeUIString(propertyVal, ui);
        }
      }
    });
    return hash;
  };
  return {
    normalizeUIString: function (uiString) {
      const uiBindings = this._getUIBindings();
      return _normalizeUIString(uiString, uiBindings);
    },
    normalizeUIKeys: function (hash) {
      const uiBindings = this._getUIBindings();
      return _normalizeUIKeys(hash, uiBindings);
    },
    normalizeUIValues: function (hash, property) {
      const uiBindings = this._getUIBindings();
      return _normalizeUIValues(hash, uiBindings, property);
    },
    _getUIBindings: function () {
      const uiBindings = _.result(this, "_uiBindings");
      return uiBindings || _.result(this, "ui");
    },
    _bindUIElements: function () {
      if (!this.ui) {
        return;
      }
      // store the ui hash in _uiBindings so they can be reset later
      // and so re-rendering the view will be able to find the bindings
      if (!this._uiBindings) {
        this._uiBindings = this.ui;
      }
      // get the bindings result, as a function or otherwise
      const bindings = _.result(this, "_uiBindings");
      // empty the ui so we don't have anything to start with
      this._ui = {};
      // bind each of the selectors
      _.each(bindings, (selector, key) => {
        this._ui[key] = this.$(selector);
      });
      this.ui = this._ui;
    },
    _unbindUIElements: function () {
      if (!this.ui || !this._uiBindings) {
        return;
      }
      // delete all of the existing ui bindings
      _.each(this.ui, ($el, name) => {
        delete this.ui[name];
      });
      // reset the ui element to the original bindings configuration
      this.ui = this._uiBindings;
      delete this._uiBindings;
      delete this._ui;
    },
    _getUI: function (name) {
      return this._ui[name];
    }
  };
})();

// ViewMixin
const BaseViewMixin = Object.assign(
  {
    Dom: VDom.DomApi,
    supportsRenderLifecycle: true,
    supportsDestroyLifecycle: true,
    _isDestroyed: false,
    isDestroyed() {
      return !!this._isDestroyed;
    },
    _isRendered: false,
    isRendered() {
      return !!this._isRendered;
    },
    _isAttached: false,
    isAttached() {
      return !!this._isAttached;
    },
    remove() {
      this._removeElement();
      this.stopListening();
      return this;
    },
    _ensureElement() {
      if (!this.el) {
        var attrs = Object.assign({}, _.result(this, "attributes"));
        if (this.id) {
          attrs["id"] = _.result(this, "id");
        }
        if (this.className) {
          attrs["class"] = _.result(this, "className");
        }
        this.setElement(this._createElement(_.result(this, "tagName")));
        this._setAttributes(attrs);
      } else {
        this.setElement(_.result(this, "el"));
      }
    },
    delegateEvents(events) {
      this._proxyBehaviorViewProperties();
      this._buildEventProxies();
      const combinedEvents = Object.assign(
        {},
        this._getBehaviorEvents(),
        this._getEvents(events),
        this._getBehaviorTriggers(),
        this._getTriggers()
      );
      return this._delegateEvents(combinedEvents);
    },
    _delegateEvents(events) {
      events || (events = _.result(this, "events"));
      if (!events) {
        return this;
      }
      const delegateEventSplitter = /^(\S+)\s*(.*)$/;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) {
          method = this[method];
        }
        if (!method) {
          continue;
        }
        var match = key.match(delegateEventSplitter);
        // this.delegate(match[1], match[2], _.bind(method, this));
        this.delegate(match[1], match[2], method.bind(this));
      }
      return this;
    },
    // Add a single event listener to the view's element (or a child element
    // using `selector`). This only works for delegate-able events: not `focus`,
    // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
    delegate: function (eventName, selector, listener) {
      const onEventParams = { delegate: selector };
      this.$el.on(
        `${eventName}.delegateEvents${this.cid}`,
        listener,
        onEventParams
      );
      return this;
    },
    // Clears all callbacks previously bound to the view by `delegateEvents`.
    // You usually don"t need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents() {
      if (this.$el) this.$el.off(".delegateEvents" + this.cid);
      return this;
    },
    // A finer-grained `undelegateEvents` for removing a single delegated event.
    // `selector` and `listener` are both optional.
    undelegate(eventName, listener) {
      this.$el.off(`${eventName}.delegateEvents${this.cid}`, listener);
      return this;
    },
    // Allows View events to utilize `@ui.` selectors
    _getEvents(events) {
      if (events) {
        return this.normalizeUIKeys(events);
      }
      if (!this.events) {
        return;
      }
      return this.normalizeUIKeys(_.result(this, "events"));
    },
    _getTriggers: function _getTriggers() {
      if (!this.triggers) {
        return;
      }
      // Normalize behavior triggers hash to allow
      // a user to use the @ui. syntax.
      var behaviorTriggers = this.normalizeUIKeys(_.result(this, "triggers"));
      return this._getViewTriggers(this.view, behaviorTriggers);
    },
    // Handle `modelEvents`, and `collectionEvents` configuration
    delegateEntityEvents() {
      this._delegateEntityEvents(this.model, this.collection);
      // bind each behaviors model and collection events
      this._delegateBehaviorEntityEvents();
      return this;
    },
    // Handle unbinding `modelEvents`, and `collectionEvents` configuration
    undelegateEntityEvents() {
      this._undelegateEntityEvents(this.model, this.collection);
      // unbind each behaviors model and collection events
      this._undelegateBehaviorEntityEvents();
      return this;
    },
    // This method binds the elements specified in the "ui" hash
    bindUIElements() {
      this._bindUIElements();
      this._bindBehaviorUIElements();
      return this;
    },
    // This method unbinds the elements specified in the "ui" hash
    unbindUIElements() {
      this._unbindUIElements();
      this._unbindBehaviorUIElements();
      return this;
    },
    getUI(name) {
      return this._getUI(name);
    },
    // Cache `childViewEvents` and `childViewTriggers`
    _buildEventProxies() {
      this._childViewEvents = this.normalizeMethods(
        _.result(this, "childViewEvents")
      );
      this._childViewTriggers = _.result(this, "childViewTriggers");
      this._eventPrefix = this._getEventPrefix();
    },
    _getEventPrefix() {
      const defaultPrefix = isEnabled("childViewEventPrefix")
        ? "childview"
        : false;
      const prefix = _.result(this, "childViewEventPrefix", defaultPrefix);
      return prefix === false ? prefix : prefix + ":";
    },
    _proxyChildViewEvents(view) {
      if (
        this._childViewEvents ||
        this._childViewTriggers ||
        this._eventPrefix
      ) {
        this.listenTo(view, "all", this._childViewEventHandler);
      }
    },
    _childViewEventHandler(eventName, ...args) {
      const childViewEvents = this._childViewEvents;
      // call collectionView childViewEvent if defined
      if (childViewEvents && childViewEvents[eventName]) {
        childViewEvents[eventName].apply(this, args);
      }
      // use the parent view's proxyEvent handlers
      const childViewTriggers = this._childViewTriggers;
      // Call the event with the proxy name on the parent layout
      if (childViewTriggers && childViewTriggers[eventName]) {
        this.triggerMethod(childViewTriggers[eventName], ...args);
      }
      if (this._eventPrefix) {
        this.triggerMethod(this._eventPrefix + eventName, ...args);
      }
    }
  },
  ElementMixin,
  BehaviorsMixin,
  CommonMixin,
  DelegateEntityEventsMixin,
  TemplateRenderMixin,
  TriggersMixin,
  UIMixin
);

// Static setter for the renderer
const setRenderer$1 = function setRenderer(renderer) {
  this.prototype._renderHtml = renderer;
  return this;
};

// Region
class Region {
  constructor(options) {
    this._setOptions(options, Region.classOptions);
    this.cid = _.uniqueId(this.cidPrefix);
    // getOption necessary because options.el may be passed as undefined
    this._initEl = this.el = this.getOption("el");
    // Handle when this.el is passed in as a $ wrapped element.
    this.el = $dom.is$Dom(this.el) ? this.el[0] : this.el;
    if (!this.el) {
      throw new MnError({
        name: "RegionError",
        message: "An 'el' must be specified for a region."
      });
    }
    this.$el = this.getEl(this.el);
    this.initialize.apply(this, arguments);
  }
  initialize() {}
}
Region.classOptions = ["allowMissingEl", "parentEl", "replaceElement"];
Region.extend = function (protoProps) {
  const Parent = this;
  let classProperties = {};
  for (let prop in protoProps) {
    if (typeof protoProps[prop] !== "function") {
      classProperties[prop] = protoProps[prop];
    }
  }
  class ExtendedRegion extends Parent {
    constructor(options = {}) {
      Object.assign(classProperties, options);
      super(classProperties);
    }
  }
  ExtendedRegion.__super__ = Parent.prototype;
  // Add static properties to the constructor function, if supplied.
  Object.assign(ExtendedRegion, Parent);
  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function and add the prototype properties.
  Object.assign(ExtendedRegion.prototype, Parent.prototype, protoProps);
  ExtendedRegion.prototype.constructor = ExtendedRegion;
  // Set a convenience property in case the parent"s prototype is needed
  // later.
  ExtendedRegion.__super__ = Parent.prototype;
  return ExtendedRegion;
};
Region.setDomApi = VDom.setDomApi;
Region.setRenderer = setRenderer$1;
let RegionProto = Region.prototype;
Object.assign(Region.prototype, CommonMixin);
RegionProto.cidPrefix = "mnr";
RegionProto.Dom = VDom.DomApi;
RegionProto.replaceElement = false;
RegionProto._isReplaced = false;
RegionProto._isSwappingView = false;
RegionProto.isReplaced = function () {
  return !!this._isReplaced;
};
RegionProto.isSwappingView = function () {
  return !!this._isSwappingView;
};

// return the region instance from the definition
function buildRegion(definition, defaults) {
  if (definition instanceof Region) {
    return definition;
  }
  if (_.isString(definition)) {
    return buildRegionFromObject(defaults, { el: definition });
  }
  if (_.isFunction(definition)) {
    return buildRegionFromObject(defaults, { regionClass: definition });
  }
  if (_.isObject(definition)) {
    return buildRegionFromObject(defaults, definition);
  }
  throw new MnError({
    message: "Improper region configuration type."
  });
}
function buildRegionFromObject(defaults, definition) {
  const options = Object.assign({}, defaults, definition);
  const RegionClass = options.regionClass;
  delete options.regionClass;
  return new RegionClass(options);
}

const ViewRegionMixin = {
  regions: {},
  _regions: {},
  regionClass: Region,
  // Internal method to initialize the regions that have been defined in a
  // `regions` attribute on this View.
  _initRegions() {
    // init regions hash
    this.regions = this.regions || {};
    this._regions = {};
    this.addRegions(_.result(this, "regions"));
  },
  // Internal method to re-initialize all of the regions by updating
  // the `el` that they point to
  _reInitRegions() {
    _invoke(this._regions, "reset");
  },
  // Add a single region, by name, to the View
  addRegion(name, definition) {
    const regions = {};
    regions[name] = definition;
    return this.addRegions(regions)[name];
  },
  // Add multiple regions as a {name: definition, name2: def2} object literal
  addRegions(regionsDefinitions) {
    // If there's nothing to add, stop here.
    if (_.isEmpty(regionsDefinitions)) {
      return;
    }
    // Normalize region selectors hash to allow
    // a user to use the @ui. syntax.
    regionsDefinitions = this.normalizeUIValues(regionsDefinitions, "el");
    // Add the regions definitions to the regions property
    this.regions = Object.assign({}, this.regions, regionsDefinitions);
    return this._addRegions(regionsDefinitions);
  },
  // internal method to build and add regions
  _addRegions(regionsDefinitions) {
    //_.result(obj, prop, defaultValue)
    // const defaultParentEl = function (this, "el") => _.result()
    const defaults = {
      regionClass: this.regionClass,
      parentEl: _.result(this, "el") //_.partial(_.result, this, "el")
    };
    return _.reduce(
      regionsDefinitions,
      (regions, definition, name) => {
        regions[name] = buildRegion(definition, defaults);
        this._addRegion(regions[name], name);
        return regions;
      },
      {}
    );
  },
  _addRegion(region, name) {
    this.triggerMethod("before:add:region", this, name, region);
    region._parentView = this;
    region._name = name;
    this._regions[name] = region;
    this.triggerMethod("add:region", this, name, region);
  },
  // Remove a single region from the View, by name
  removeRegion(name) {
    const region = this._regions[name];
    this._removeRegion(region, name);
    return region;
  },
  // Remove all regions from the View
  removeRegions() {
    const regions = this._getRegions();
    _.each(this._regions, this._removeRegion.bind(this));
    return regions;
  },
  _removeRegion(region, name) {
    this.triggerMethod("before:remove:region", this, name, region);
    region.destroy();
    this.triggerMethod("remove:region", this, name, region);
  },
  // Called in a region's destroy
  _removeReferences(name) {
    delete this.regions[name];
    delete this._regions[name];
  },
  // Empty all regions in the region manager, but
  // leave them attached
  emptyRegions() {
    const regions = this.getRegions();
    _invoke(regions, "empty");
    return regions;
  },
  // Checks to see if view contains region
  // Accepts the region name
  // hasRegion("main")
  hasRegion(name) {
    return !!this.getRegion(name);
  },
  // Provides access to regions
  // Accepts the region name
  // getRegion("main")
  getRegion(name) {
    if (!this._isRendered) {
      this.render();
    }
    return this._regions[name];
  },
  _getRegions() {
    return _.clone(this._regions);
  },
  // Get all regions
  getRegions() {
    if (!this._isRendered) {
      this.render();
    }
    return this._getRegions();
  },
  showChildView(name, view, options) {
    const region = this.getRegion(name);
    region.show(view, options);
    return view;
  },
  detachChildView(name) {
    return this.getRegion(name).detachView();
  },
  getChildView(name) {
    return this.getRegion(name).currentView;
  }
};

const ViewElementMixin = {
  setElement(element) {
    this.undelegateEvents();
    this._setElement(element);
    this.delegateEvents();
    this._isRendered = this.Dom.hasContents(this.el);
    this._isAttached = this.Dom.hasEl(document.documentElement, this.el);
    if (this._isRendered) {
      this.bindUIElements();
    }
    return this;
  },
  _setElement(el) {
    this.$el = $dom.is$Dom(el) ? el : $dom(el);
    this.el = this.$el[0];
  },
  _removeElement() {
    this.$el.remove();
  },
  _createElement(tagName) {
    return document.createElement(tagName);
  }
};

const ViewRenderMixin = {
  render() {
    var template = this.getTemplate();
    if (template === false || this._isDestroyed) {
      return this;
    }
    this.triggerMethod("before:render", this);
    // If this is not the first render call, then we need to
    // re-initialize the `el` for each region
    if (this._isRendered && !this.elTree) {
      this._reInitRegions();
    }
    this._renderTemplate(template);
    //
    if (this.elTree) {
      // need to ensure el and $el are correctly set, because vdom has been replaced it in the real DOM
      this.setElement(this.getOption("el"));
      // this.$el = $dom(this.el);
    }
    this.bindUIElements();
    this._isRendered = true;
    this.triggerMethod("render", this);
    return this;
  }
};

class View {
  constructor(options) {
    this._setOptions(options, View.classOptions);
    monitorViewEvents(this);
    this._initBehaviors();
    this._initRegions();
    this.cid = _.uniqueId("view");
    Object.assign(this, _.pick(options, View.classProperties));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEntityEvents();
    this._triggerEventOnBehaviors("initialize", this, options);
  }
  initialize() {}
  _setAttributes(attributes) {
    this.$el.attr(attributes);
  }
  _removeChildren() {
    this.removeRegions();
  }
}
View.classProperties = [
  // List of view options to be set as properties.
  "model",
  "collection",
  "el",
  "id",
  "attributes",
  "className",
  "tagName",
  "events"
];
View.classOptions = [
  "behaviors",
  "childViewEventPrefix",
  "childViewEvents",
  "childViewTriggers",
  "collectionEvents",
  "events",
  "modelEvents",
  "regionClass",
  "regions",
  "template",
  "templateContext",
  "triggers",
  "ui"
];
View.extend = function (protoProps) {
  const Parent = this;
  let classProperties = {};
  for (let prop in protoProps) {
    if (typeof protoProps[prop] !== "function") {
      classProperties[prop] = protoProps[prop];
    }
  }
  class ExtendedView extends Parent {
    constructor(options = {}) {
      Object.assign(classProperties, options);
      super(classProperties);
    }
  }
  // Set a convenience property in case the parent"s prototype is needed later.
  ExtendedView.__super__ = Parent.prototype;
  // Add static properties to the constructor function, if supplied.
  Object.assign(ExtendedView, Parent);
  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function and add the prototype properties.
  Object.assign(ExtendedView.prototype, Parent.prototype, protoProps);
  ExtendedView.prototype.constructor = ExtendedView;
  return ExtendedView;
};
View.setDomApi = VDom.setDomApi;
View.setRenderer = setRenderer$1;
Object.assign(
  View.prototype,
  EventMixin,
  ViewElementMixin,
  ViewRenderMixin,
  ViewRegionMixin,
  BaseViewMixin
);

const RegionElementMixin = {
  getEl(el) {
    const context = _.result(this, "parentEl");
    if (context && _.isString(el)) {
      return this.Dom.findEl(context, el);
    }
    return this.Dom.getEl(el);
  },
  _ensureElement(options = {}) {
    if (!_.isObject(this.el)) {
      this.$el = this.getEl(this.el);
      this.el = this.$el[0];
      // Make sure the $el contains only the el
      this.$el = this.Dom.getEl(this.el);
    }
    if (!this.$el || this.$el.length === 0) {
      const allowMissingEl =
        typeof options.allowMissingEl === "undefined"
          ? !!_.result(this, "allowMissingEl")
          : !!options.allowMissingEl;
      if (allowMissingEl) {
        return false;
      } else {
        throw new MnError({
          name: "RegioNError",
          message: `An "el" must exist in DOM for this region ${this.cid}`
        });
      }
    }
    return true;
  },
  _replaceEl(view) {
    this._restoreEl();
    view.on("before:destroy", this._restoreEl, this);
    this.Dom.replaceEl(view.el, this.el);
    this._isReplaced = true;
  },
  _restoreEl() {
    // There is nothing to replace
    if (!this._isReplaced) {
      return;
    }
    const view = this.currentView;
    if (!view) {
      return;
    }
    this._detachView(view);
    this._isReplaced = false;
  }
};

function renderView(view) {
  if (view._isRendered) {
    return;
  }
  if (!view.supportsRenderLifecycle) {
    view.triggerMethod("before:render", view);
  }
  view.render();
  view._isRendered = true;
  if (!view.supportsRenderLifecycle) {
    view.triggerMethod("render", view);
  }
}
function destroyView(view, disableDetachEvents) {
  if (view.destroy) {
    // Attach flag for public destroy function internal check
    view._disableDetachEvents = disableDetachEvents;
    view.destroy();
    return;
  }
  // Destroy for non-Marionette Views
  if (!view.supportsDestroyLifecycle) {
    view.triggerMethod("before:destroy", view);
  }
  const shouldTriggerDetach = view._isAttached && !disableDetachEvents;
  if (shouldTriggerDetach) {
    view.triggerMethod("before:detach", view);
  }
  view.remove();
  if (shouldTriggerDetach) {
    view._isAttached = false;
    view.triggerMethod("detach", view);
  }
  view._isDestroyed = true;
  if (!view.supportsDestroyLifecycle) {
    view.triggerMethod("destroy", view);
  }
}

const RegionRemoveViewMixin = {
  removeView(view) {
    this.destroyView(view);
  },
  destroyView(view) {
    if (view._isDestroyed) {
      return view;
    }
    destroyView(view, this._shouldDisableMonitoring());
    return view;
  },
  _shouldDisableMonitoring() {
    return this._parentView && this._parentView.monitorViewEvents === false;
  }
};

const RegionDestroyMixin = {
  _isDestroyed: false,
  isDestroyed() {
    return this._isDestroyed;
  },
  destroy(options) {
    if (this._isDestroyed) {
      return this;
    }
    this.triggerMethod("before:destroy", this, options);
    this._isDestroyed = true;
    this.reset(options);
    if (this._name) {
      this._parentView._removeReferences(this._name);
    }
    delete this._parentView;
    delete this._name;
    this.triggerMethod("destroy", this, options);
    this.stopListening();
    return this;
  },
  reset(options) {
    this.empty(options);
    if (this.$el) {
      this.el = this._initEl;
    }
    delete this.$el;
    return this;
  }
};

const RegionDetachViewMixin = {
  detachView() {
    const view = this.currentView;
    if (!view) {
      return;
    }
    this._empty(view);
    return view;
  },
  _detachView(view) {
    const shouldTriggerDetach =
      view._isAttached && !this._shouldDisableMonitoring();
    const shouldRestoreEl = this._isReplaced;
    if (shouldTriggerDetach) {
      view.triggerMethod("before:detach", view);
    }
    if (shouldRestoreEl) {
      this.Dom.replaceEl(this.el, view.el);
    } else {
      this.detachHtml();
    }
    if (shouldTriggerDetach) {
      view._isAttached = false;
      view.triggerMethod("detach", view);
    }
  },
  empty(options = { allowMissingEl: true }) {
    const view = this.currentView;
    // If there is no view in the region we should only detach current html
    if (!view) {
      if (this._ensureElement(options)) {
        this.detachHtml();
      }
      return this;
    }
    this._empty(view, true);
    return this;
  },
  _empty(view, shouldDestroy) {
    view.off("destroy", this._empty, this);
    this.triggerMethod("before:empty", this, view);
    this._restoreEl();
    delete this.currentView;
    if (!view._isDestroyed) {
      if (shouldDestroy) {
        this.removeView(view);
      } else {
        this._detachView(view);
      }
      this._stopChildViewEvents(view);
    }
    this.triggerMethod("empty", this, view);
  },
  detachHtml() {
    this.Dom.detachContents(this.el, this.$el);
  },
  _stopChildViewEvents(view) {
    const parentView = this._parentView;
    if (!parentView) {
      return;
    }
    this._parentView.stopListening(view);
  }
};

// Collection View
/**
 * CollectionView
 * --------------
 */
/**
 * The CollectionView will loop through all of the models in the specified
 * collection, render each of them using a specified childView, then append
 * the results of the child view's el to the collection view's el. By
 * default the CollectionView will maintain a sorted collection's order in the
 * DOM. This behavior can be disabled by specifying {sort: false} on
 * initialize.
 */
class CollectionView {
  constructor(options) {
    this._setOptions(options, CollectionView.classOptions);
    monitorViewEvents(this);
    this._initChildViewStorage();
    this._initBehaviors();
    this.cid = _.uniqueId("view");
    Object.assign(this, _.pick(options, CollectionView.classProperties));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    // Init empty region
    this.getEmptyRegion();
    this.delegateEntityEvents();
    this._triggerEventOnBehaviors("initialize", this, options);
  }
}
CollectionView.classProperties = [
  "model",
  "collection",
  "el",
  "id",
  "attributes",
  "className",
  "tagName",
  "events"
];
CollectionView.classOptions = [
  "behaviors",
  "childView",
  "childViewContainer",
  "childViewEventPrefix",
  "childViewEvents",
  "childViewOptions",
  "childViewTriggers",
  "collectionEvents",
  "emptyView",
  "emptyViewOptions",
  "events",
  "modelEvents",
  "sortWithCollection",
  "template",
  "templateContext",
  "triggers",
  "ui",
  "viewComparator",
  "viewFilter"
];
CollectionView.extend = function (protoProps) {
  const Parent = this;
  let classProperties = {};
  for (let prop in protoProps) {
    if (typeof protoProps[prop] !== "function") {
      classProperties[prop] = protoProps[prop];
    }
  }
  class ExtendedCollectionView extends Parent {
    constructor(options = {}) {
      // for Behavior class, we need the view argument
      Object.assign(classProperties, options);
      super(classProperties);
    }
  }
  ExtendedCollectionView.__super__ = Parent.prototype;
  // Add static properties to the constructor function, if supplied.
  Object.assign(ExtendedCollectionView, Parent);
  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function and add the prototype properties.
  Object.assign(ExtendedCollectionView.prototype, Parent.prototype, protoProps);
  ExtendedCollectionView.prototype.constructor = ExtendedCollectionView;
  // Set a convenience property in case the parent"s prototype is needed
  // later.
  ExtendedCollectionView.__super__ = Parent.prototype;
  return ExtendedCollectionView;
};
CollectionView.setDomApi = VDom.setDomApi;
CollectionView.setRenderer = setRenderer$1;
let CollectionViewProto = CollectionView.prototype;
Object.assign(CollectionView.prototype, BaseViewMixin);
CollectionViewProto._removeReferences = function (name) {
  delete this.regions[name];
  delete this._regions[name];
};
CollectionViewProto.buildChildView = function (
  child,
  ChildViewClass,
  childViewOptions
) {
  const options = Object.assign({ model: child }, childViewOptions);
  return new ChildViewClass(options);
};
CollectionViewProto._setupChildView = function (view) {
  monitorViewEvents(view);
  // We need to listen for if a view is destroyed in a way other
  // than through the CollectionView.
  // If this happens we need to remove the reference to the view
  // since once a view has been destroyed we can not reuse it.
  view.on("destroy", this.removeChildView, this);
  // set up the child view event forwarding
  this._proxyChildViewEvents(view);
};
CollectionViewProto.setElement = function (element) {
  this.undelegateEvents();
  View.prototype._setElement.apply(this, arguments);
  this.delegateEvents();
  this._isAttached = this.Dom.hasEl(document.documentElement, this.el);
  return this;
};
CollectionViewProto.render = function () {
  if (this._isDestroyed) {
    return this;
  }
  this.triggerMethod("before:render", this);
  this._destroyChildren();
  if (this.collection) {
    this._addChildModels(this.collection.models);
    this._initialEvents();
  }
  const template = this.getTemplate();
  if (template) {
    this._renderTemplate(template);
    this.bindUIElements();
  }
  this._getChildViewContainer();
  this.sort();
  this._isRendered = true;
  this.triggerMethod("render", this);
  return this;
};

const RegionShowViewMixin = {
  show(view, options) {
    if (!this._ensureElement(options)) {
      return;
    }
    view = this._getView(view, options);
    if (view === this.currentView) {
      return this;
    }
    this._isSwappingView = !!this.currentView;
    this.triggerMethod("before:show", this, view, options);
    // Assume an attached view is already in the region for pre-existing DOM
    if (!view._isAttached) {
      this.empty(options);
    }
    this._setupChildView(view);
    this.currentView = view;
    renderView(view);
    this._attachView(view, options);
    this.triggerMethod("show", this, view, options);
    this._isSwappingView = false;
    return this;
  },
  _getView(view, options = {}) {
    if (!view) {
      throw new MnError({
        name: "RegionError",
        message:
          "The view passed is undefined and therefore invalid. You must pass a view instance to show."
      });
    }
    if (view._isDestroyed) {
      throw new MnError({
        name: "RegionError",
        message: `View (cid: "${view.cid}") has already been destroyed and cannot be used.`
      });
    }
    if (view instanceof View || CollectionView) {
      return view;
    }
    const viewOptions = this._getViewOptions(view);
    return new View(viewOptions);
  },
  _getViewOptions(viewOptions) {
    if (_.isFunction(viewOptions)) {
      return { template: viewOptions };
    }
    if (_.isObject(viewOptions)) {
      return viewOptions;
    }
    const template = function () {
      return viewOptions;
    };
    return { template };
  },
  _setupChildView(view) {
    monitorViewEvents(view);
    this._proxyChildViewEvents(view);
    // We need to listen for if a view is destroyed in a way other than through the region.
    // If this happens we need to remove the reference to the currentView since once a view
    // has been destroyed we can not reuse it.
    view.on("destroy", this._empty, this);
  },
  _proxyChildViewEvents(view) {
    const parentView = this._parentView;
    if (!parentView) {
      return;
    }
    parentView._proxyChildViewEvents(view);
  },
  _attachView(view, options = {}) {
    const shouldTriggerAttach =
      !view._isAttached &&
      this.Dom.hasEl(document.documentElement, this.el) &&
      !this._shouldDisableMonitoring();
    const shouldReplaceEl =
      typeof options.replaceElement === "undefined"
        ? !!_.result(this, "replaceElement")
        : !!options.replaceElement;
    if (shouldTriggerAttach) {
      view.triggerMethod("before:attach", view);
    }
    if (shouldReplaceEl) {
      this._replaceEl(view);
    } else {
      this.attachHtml(view);
    }
    if (shouldTriggerAttach) {
      view._isAttached = true;
      view.triggerMethod("attach", view);
    }
  },
  attachHtml(view) {
    this.Dom.appendContents(this.el, view.el, {
      _$el: this.$el,
      _$contents: view.$el
    });
  },
  hasView() {
    return !!this.currentView;
  }
};

const CollectionViewGetChildViewMixin = {
  _getChildView(child) {
    let childView = this.childView;
    if (!childView) {
      throw new MnError({
        name: "CollectionViewError",
        message: "A 'childView' must be specified"
      });
    }
    childView = this._getView(childView, child);
    if (!childView) {
      throw new MnError({
        name: "CollectionViewError",
        message:
          "'childView' must be a view class or a function that returns a view class",
        url: "marionette.collectionview.html#collectionviews-childview"
      });
    }
    return childView;
  },
  _getView(view, child) {
    if (view.prototype instanceof View || view === View) {
      return view;
    } else if (_.isFunction(view)) {
      return view.call(this, child);
    }
  },
  _getChildViewOptions(child) {
    if (_.isFunction(this.childViewOptions)) {
      return this.childViewOptions(child);
    }
    return this.childViewOptions;
  }
};

const CollectionViewAddChildViewsMixin = {
  _addChildModels(models) {
    return models.map(this._addChildModel.bind(this));
  },
  _addChildModel(model) {
    const view = this._createChildView(model);
    this._addChild(view);
    return view;
  },
  _addChild(view, index) {
    this.triggerMethod("before:add:child", this, view);
    this._setupChildView(view);
    this._children._add(view, index);
    this.children._add(view, index);
    this.triggerMethod("add:child", this, view);
  },
  _createChildView(model) {
    const ChildView = this._getChildView(model);
    const childViewOptions = this._getChildViewOptions(model);
    const view = this.buildChildView(model, ChildView, childViewOptions);
    return view;
  },
  addChildView(view, index) {
    if (!view || view._isDestroyed) {
      return view;
    }
    if (!this._isRendered) {
      this.render();
    }
    const hasIndex = typeof index !== "undefined";
    // Only cache views if added to the end
    if (!hasIndex || index >= this._children.length) {
      this._addedViews = [view];
    }
    this._addChild(view, index);
    if (hasIndex) {
      this._renderChildren();
    } else {
      this.sort();
    }
    return view;
  }
};

const makeContainerIterator = (function () {
  const viewMatcher = function viewMatcher(attrs) {
    var matcher = _.matches(attrs);
    return function (view) {
      return matcher(view);
    };
  };
  return function makeContainerIterator(iteratee) {
    if (_.isFunction(iteratee)) {
      return iteratee;
    }
    if (_.isObject(iteratee)) {
      return viewMatcher(iteratee);
    }
    if (_.isString(iteratee)) {
      return function (view) {
        return view[iteratee];
      };
    }
    return iteratee;
  };
})();
class ChildViewContainer {
  constructor() {
    this._init();
  }
}
let ChildViewContainerProto = ChildViewContainer.prototype;
ChildViewContainerProto._init = function () {
  this._views = [];
  this._viewsByCid = {};
  this._indexByModel = {};
  this._updateLength();
};
ChildViewContainerProto._add = function (view, index = this._views.length) {
  this._addViewIndexes(view);
  // add to end by default
  this._views.splice(index, 0, view);
  this._updateLength();
};
ChildViewContainerProto._addViewIndexes = function (view) {
  // store the view
  this._viewsByCid[view.cid] = view;
  // index it by model
  if (view.model) {
    this._indexByModel[view.model.cid] = view;
  }
};
ChildViewContainerProto._sort = function (comparator, context) {
  const stringComparator = function (comparator, view) {
    return view.model && view.model.get(comparator);
  };
  if (_.isString(comparator)) {
    return this._sortBy((view) => stringComparator(comparator, view));
  }
  if (comparator.length === 1) {
    return this._sortBy(comparator.bind(context));
  }
  return this._views.sort(comparator.bind(context));
};
ChildViewContainerProto._sortBy = function (comparator) {
  const sortedViews = _.sortBy(this._views, comparator);
  this._set(sortedViews);
  return sortedViews;
};
ChildViewContainerProto._set = function (views, shouldReset) {
  this._views.length = 0;
  this._views.push.apply(this._views, views.slice(0));
  if (shouldReset) {
    this._viewsByCid = {};
    this._indexByModel = {};
    views.forEach(() => this._addViewIndexes.bind(this));
    this._updateLength();
  }
};
ChildViewContainerProto._swap = function (view1, view2) {
  const view1Index = this.findIndexByView(view1);
  const view2Index = this.findIndexByView(view2);
  if (view1Index === -1 || view2Index === -1) {
    return;
  }
  const swapView = this._views[view1Index];
  this._views[view1Index] = this._views[view2Index];
  this._views[view2Index] = swapView;
};
ChildViewContainerProto.findByModel = function (model) {
  return this.findByModelCid(model.cid);
};
ChildViewContainerProto.findByModelCid = function (modelCid) {
  return this._indexByModel[modelCid];
};
ChildViewContainerProto.findByIndex = function (index) {
  return this._views[index];
};
ChildViewContainerProto.findIndexByView = function (view) {
  return this._views.indexOf(view);
};
ChildViewContainerProto.findByCid = function (cid) {
  return this._viewsByCid[cid];
};
ChildViewContainerProto.hasView = function (view) {
  return !!this.findByCid(view.cid);
};
ChildViewContainerProto._remove = function (view) {
  if (!this._viewsByCid[view.cid]) {
    return;
  }
  // delete model index
  if (view.model) {
    delete this._indexByModel[view.model.cid];
  }
  // remove the view from the container
  delete this._viewsByCid[view.cid];
  const index = this.findIndexByView(view);
  this._views.splice(index, 1);
  this._updateLength();
};
ChildViewContainerProto._updateLength = function () {
  this.length = this._views.length;
};
ChildViewContainerProto.forEach = function (iterator) {
  this._views.forEach(iterator);
};
ChildViewContainerProto.map = function (iterator) {
  return this._views.map(iterator);
};
ChildViewContainerProto.find = function (predicate) {
  return this._views.find(makeContainerIterator(predicate));
};
ChildViewContainerProto.filter = function (predicate) {
  return this._views.filter(makeContainerIterator(predicate));
};
ChildViewContainerProto.every = function (predicate) {
  return this._views.every(makeContainerIterator(predicate));
};
ChildViewContainerProto.some = function (predicate) {
  return this._views.some(makeContainerIterator(predicate));
};
ChildViewContainerProto.contains = function (view) {
  return this._views.includes(view);
};
ChildViewContainerProto.isEmpty = function () {
  return this._views.length > 0;
};
ChildViewContainerProto.pluck = function (attr) {
  return this._views.map(function (view) {
    return view[attr];
  });
};

const CollectionViewChildContainerMixin = {
  _initChildViewStorage() {
    this._children = new ChildViewContainer();
    this.children = new ChildViewContainer();
  },
  _getImmediateChildren() {
    return this.children._views;
  },
  _getChildViewContainer() {
    const childViewContainer = _.result(this, "childViewContainer");
    this.$container = childViewContainer
      ? this.$(childViewContainer)
      : this.$el;
    if (!this.$container.length) {
      throw new MnError({
        name: "CollectionViewError",
        message: `The specified "childViewContainer" was not found: ${childViewContainer}`
      });
    }
  }
};

const CollectionViewCollectionEventsMixin = {
  // Configured the initial events that the collection view binds to.
  _initialEvents() {
    if (this._isRendered) {
      return;
    }
    this.listenTo(this.collection, {
      sort: this._onCollectionSort,
      reset: this._onCollectionReset,
      update: this._onCollectionUpdate
    });
  },
  // Internal method. This checks for any changes in the order of the collection.
  // If the index of any view doesn't match, it will re-sort.
  _onCollectionSort(collection, args) {
    if (!this.sortWithCollection || this.viewComparator === false) {
      return;
    }
    const add = args.add,
      merge = args.merge,
      remove = args.remove;
    // If the data is changing we will handle the sort later in `_onCollectionUpdate`
    if (add || remove || merge) {
      return;
    }
    // If the only thing happening here is sorting, sort.
    this.sort();
  },
  _onCollectionReset() {
    this._destroyChildren();
    this._addChildModels(this.collection.models);
    this.sort();
  },
  // Handle collection update model additions and removals
  _onCollectionUpdate(collection, options) {
    const changes = options.changes;
    // Remove first since it'll be a shorter array lookup.
    const removedViews =
      changes.removed.length && this._removeChildModels(changes.removed);
    this._addedViews =
      changes.added.length && this._addChildModels(changes.added);
    this._detachChildren(removedViews);
    this.sort();
    // Destroy removed child views after all of the render is complete
    this._removeChildViews(removedViews);
  }
};

const CollectionViewDetachChildViewsMixin = {
  _detachChildren(detachingViews) {
    detachingViews.forEach((view) => {
      this._detachChildView.bind(this, view);
    });
  },
  _detachChildView(view) {
    const shouldTriggerDetach =
      view._isAttached && this.monitorViewEvents !== false;
    if (shouldTriggerDetach) {
      view.triggerMethod("before:detach", view);
    }
    this.detachHtml(view);
    if (shouldTriggerDetach) {
      view._isAttached = false;
      view.triggerMethod("detach", view);
    }
  },
  detachHtml(view) {
    this.Dom.detachEl(view.el, view.$el);
  }
};

const CollectionViewEmptyViewMixin = {
  getEmptyRegion() {
    if (this._emptyRegion && !this._emptyRegion.isDestroyed()) {
      return this._emptyRegion;
    }
    this._emptyRegion = new Region({ el: this.el, replaceElement: false });
    this._emptyRegion._parentView = this;
    return this._emptyRegion;
  },
  isEmpty() {
    return !this.children.length;
  },
  _showEmptyView() {
    const EmptyView = this._getEmptyView();
    if (!EmptyView) {
      return;
    }
    const options = this._getEmptyViewOptions();
    const emptyRegion = this.getEmptyRegion();
    emptyRegion.show(new EmptyView(options));
  },
  _getEmptyView() {
    const emptyView = this.emptyView;
    if (!emptyView) {
      return;
    }
    return this._getView(emptyView);
  },
  _destroyEmptyView() {
    const emptyRegion = this.getEmptyRegion();
    // Only empty if a view is show so the region
    // doesn't detach any other unrelated HTML
    if (emptyRegion.hasView()) {
      emptyRegion.empty();
    }
  },
  _getEmptyViewOptions() {
    const emptyViewOptions = this.emptyViewOptions || this.childViewOptions;
    if (_.isFunction(emptyViewOptions)) {
      return emptyViewOptions.call(this);
    }
    return emptyViewOptions;
  }
};

const CollectionViewFilterMixin = {
  filter() {
    if (this._isDestroyed) {
      return this;
    }
    this._filterChildren();
    this._renderChildren();
    return this;
  },
  _filterChildren() {
    if (!this._children.length) {
      return;
    }
    const viewFilter = this._getFilter();
    if (!viewFilter) {
      const shouldReset = this.children.length !== this._children.length;
      this.children._set(this._children._views, shouldReset);
      return;
    }
    // If children are filtered prevent added to end perf
    delete this._addedViews;
    this.triggerMethod("before:filter", this);
    const attachViews = [];
    const detachViews = [];
    this._children._views.forEach((view, key, children) => {
      (viewFilter.call(this, view, key, children)
        ? attachViews
        : detachViews
      ).push(view);
    });
    this._detachChildren(detachViews);
    // reset children
    this.children._set(attachViews, true);
    this.triggerMethod("filter", this, attachViews, detachViews);
  },
  _getFilter() {
    const viewFilter = this.getFilter();
    if (!viewFilter) {
      return false;
    }
    if (_.isFunction(viewFilter)) {
      return viewFilter;
    }
    // Support filter predicates `{ fooFlag: true }`
    if (_.isObject(viewFilter)) {
      const matcher = _.matches(viewFilter);
      return function (view) {
        return matcher(view.model && view.model.attributes);
      };
    }
    // Filter by model attribute
    if (_.isString(viewFilter)) {
      return function (view) {
        return view.model && view.model.get(viewFilter);
      };
    }
    throw new MnError({
      name: "CollectionViewError",
      message:
        "'viewFilter' must be a function, predicate object literal, a string indicating a model attribute, or falsy"
    });
  },
  getFilter() {
    return this.viewFilter;
  },
  setFilter(filter, options = { preventRender: false }) {
    const filterChanged = this.viewFilter !== filter;
    const shouldRender = filterChanged && !options.preventRender;
    this.viewFilter = filter;
    if (shouldRender) {
      this.filter();
    }
    return this;
  },
  removeFilter(options) {
    return this.setFilter(null, options);
  }
};

const CollectionViewRemoveChildViewsMixin = {
  swapChildViews(view1, view2) {
    if (!this._children.hasView(view1) || !this._children.hasView(view2)) {
      throw new MnError({
        name: "CollectionViewError",
        message: "Both views must be children of the collection view to swap.",
        url: "marionette.collectionview.html#swapping-child-views"
      });
    }
    this._children._swap(view1, view2);
    this.Dom.swapEl(view1.el, view2.el);
    // If the views are not filtered the same, refilter
    if (this.children.hasView(view1) !== this.children.hasView(view2)) {
      this.filter();
    } else {
      this.children._swap(view1, view2);
    }
    return this;
  },
  _removeChildModels(models) {
    return models.reduce((views, model) => {
      const removeView = this._removeChildModel(model);
      if (removeView) {
        views.push(removeView);
      }
      return views;
    }, []);
  },
  _removeChild(view) {
    this.triggerMethod("before:remove:child", this, view);
    this.children._remove(view);
    this._children._remove(view);
    this.triggerMethod("remove:child", this, view);
  },
  detachChildView(view) {
    this.removeChildView(view, { shouldDetach: true });
    return view;
  },
  removeChildView(view, options) {
    if (!view) {
      return view;
    }
    this._removeChildView(view, options);
    this._removeChild(view);
    if (this.isEmpty()) {
      this._showEmptyView();
    }
    return view;
  },
  _removeChildViews(views) {
    views.forEach((view) => {
      this._removeChildView.bind(this, view);
    });
  },
  _removeChildView(view, options = { shouldDetach: false }) {
    view.off("destroy", this.removeChildView, this);
    if (options.shouldDetach) {
      this._detachChildView(view);
    } else {
      this._destroyChildView(view);
    }
    this.stopListening(view);
  },
  _removeChildModel(model) {
    const view = this._children.findByModel(model);
    if (view) {
      this._removeChild(view);
    }
    return view;
  },
  _destroyChildView(view) {
    if (view._isDestroyed) {
      return;
    }
    const shouldDisableEvents = this.monitorViewEvents === false;
    destroyView(view, shouldDisableEvents);
  },
  _removeChildren() {
    this._destroyChildren();
    const emptyRegion = this.getEmptyRegion();
    emptyRegion.destroy();
    delete this._addedViews;
  },
  _destroyChildren() {
    if (!this._children.length) {
      return;
    }
    this.triggerMethod("before:destroy:children", this);
    if (this.monitorViewEvents === false) {
      this.Dom.detachContents(this.el, this.$el);
    }
    this._removeChildViews(this._children._views);
    // After all children have been destroyed re-init the container
    this._children._init();
    this.children._init();
    this.triggerMethod("destroy:children", this);
  }
};

const CollectionViewRenderChildViewsMixin = {
  _renderChildren() {
    const views = this._addedViews || this.children._views;
    this.triggerMethod("before:render:children", this, views);
    if (this.isEmpty()) {
      this._showEmptyView();
    } else {
      this._destroyEmptyView();
      const els = this._getBuffer(views);
      this._attachChildren(els, views);
    }
    delete this._addedViews;
    this.triggerMethod("render:children", this, views);
  },
  _getBuffer(views) {
    const elBuffer = this.Dom.createBuffer();
    views.forEach((view) => {
      renderView(view);
      this.Dom.appendContents(elBuffer, view.el, { _$contents: view.$el });
    });
    return elBuffer;
  },
  _attachChildren(els, views) {
    const shouldTriggerAttach =
      this._isAttached && this.monitorViewEvents !== false;
    views = shouldTriggerAttach ? views : [];
    views.forEach((view) => {
      if (view._isAttached) {
        return;
      }
      view.triggerMethod("before:attach", view);
    });
    this.attachHtml(els, this.$container);
    views.forEach((view) => {
      if (view._isAttached) {
        return;
      }
      view._isAttached = true;
      view.triggerMethod("attach", view);
    });
  },
  attachHtml(els, $container) {
    this.Dom.appendContents($container[0], els, { _$el: $container });
  }
};

const CollectionViewSortMixin = {
  sortWithCollection: true,
  sort() {
    this._sortChildren();
    this.filter();
    return this;
  },
  _sortChildren() {
    if (!this._children.length) {
      return;
    }
    let viewComparator = this.getComparator();
    if (!viewComparator) {
      return;
    }
    // If children are sorted prevent added to end perf
    delete this._addedViews;
    this.triggerMethod("before:sort", this);
    this._children._sort(viewComparator, this);
    this.triggerMethod("sort", this);
  },
  setComparator(comparator, options = { preventRender: false }) {
    const comparatorChanged = this.viewComparator !== comparator;
    const shouldSort = comparatorChanged && !options.preventRender;
    this.viewComparator = comparator;
    if (shouldSort) {
      this.sort();
    }
    return this;
  },
  removeComparator(options) {
    return this.setComparator(null, options);
  },
  getComparator() {
    if (this.viewComparator) {
      return this.viewComparator;
    }
    if (
      !this.sortWithCollection ||
      this.viewComparator === false ||
      !this.collection
    ) {
      return false;
    }
    return this._viewComparator;
  },
  _viewComparator(view) {
    return this.collection.indexOf(view.model);
  }
};

// Behavior
class Behavior {
  constructor(options, view) {
    // Setup reference to the view.
    // this comes in handle when a behavior
    // wants to directly talk up the chain
    // to the view.
    this.view = view;
    this._setOptions(options, Behavior.classOptions);
    this.cid = _.uniqueId(this.cidPrefix);
    // Construct an internal UI hash using the behaviors UI
    // hash combined and overridden by the view UI hash.
    // This allows the user to use UI hash elements defined
    // in the parent view as well as those defined in the behavior.
    // This order will help the reuse and share of a behavior
    // between multiple views, while letting a view override
    // a selector under an UI key.
    this.ui = Object.assign({}, _.result(this, "ui"), _.result(view, "ui"));
    // Proxy view triggers
    this.listenTo(view, "all", this.triggerMethod);
    this.initialize.apply(this, arguments);
  }
}
Behavior.classOptions = [
  "collectionEvents",
  "events",
  "modelEvents",
  "triggers",
  "ui"
];
Behavior.extend = function (protoProps) {
  const Parent = this;
  let classProperties = {};
  for (let prop in protoProps) {
    if (typeof protoProps[prop] !== "function") {
      classProperties[prop] = protoProps[prop];
    }
  }
  class ExtendedBehavior extends Parent {
    constructor(options = {}, viewArg) {
      // for Behavior class, we need the view argument
      Object.assign(classProperties, options);
      super(classProperties, viewArg);
    }
  }
  // Set a convenience property in case the parent"s prototype is needed later.
  ExtendedBehavior.__super__ = Parent.prototype;
  // Add static properties to the constructor function, if supplied.
  Object.assign(ExtendedBehavior, Parent);
  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function and add the prototype properties.
  Object.assign(ExtendedBehavior.prototype, Parent.prototype, protoProps);
  ExtendedBehavior.prototype.constructor = ExtendedBehavior;
  return ExtendedBehavior;
};
const BehaviorProto = Behavior.prototype;
Object.assign(
  Behavior.prototype,
  CommonMixin,
  DelegateEntityEventsMixin,
  TriggersMixin,
  UIMixin
);
// Behavior Methods
// --------------
BehaviorProto.cidPrefix = "mnb";
// This is a noop method intended to be overridden
BehaviorProto.initialize = function () {};
BehaviorProto.$ = function () {
  return this.view.$.apply(this.view, arguments);
};
BehaviorProto.destroy = function () {
  this.stopListening();
  this.view._removeBehavior(this);
  this._deleteEntityEventHandlers();
  return this;
};
BehaviorProto.proxyViewProperties = function () {
  this.$el = this.view.$el;
  this.el = this.view.el;
  return this;
};
BehaviorProto.bindUIElements = function () {
  this._bindUIElements();
  return this;
};
BehaviorProto.unbindUIElements = function () {
  this._unbindUIElements();
  return this;
};
BehaviorProto.getUI = function (name) {
  return this._getUI(name);
};
BehaviorProto.delegateEntityEvents = function () {
  this._delegateEntityEvents(this.view.model, this.view.collection);
  return this;
};
BehaviorProto.undelegateEntityEvents = function () {
  this._undelegateEntityEvents(this.view.model, this.view.collection);
  return this;
};
BehaviorProto._getEvents = function () {
  if (!this.events) {
    return;
  }
  // Normalize behavior events hash to allow
  // a user to use the @ui. syntax.
  const behaviorEvents = this.normalizeUIKeys(_.result(this, "events"));
  // binds the handler to the behavior and builds a unique eventName
  return _.reduce(
    behaviorEvents,
    (events, behaviorHandler, key) => {
      if (!_.isFunction(behaviorHandler)) {
        behaviorHandler = this[behaviorHandler];
      }
      if (!behaviorHandler) {
        return events;
      }
      key = getNamespacedEventName(key, this.cid);
      events[key] = behaviorHandler.bind(this);
      return events;
    },
    {}
  );
};
BehaviorProto._getTriggers = function () {
  if (!this.triggers) {
    return;
  }
  // Normalize behavior triggers hash to allow
  // a user to use the @ui. syntax.
  const behaviorTriggers = this.normalizeUIKeys(_.result(this, "triggers"));
  return this._getViewTriggers(this.view, behaviorTriggers);
};

// Application
class Application {
  constructor(options = {}) {
    this._setOptions(options, Application.classOptions);
    this.cid = _.uniqueId(this.cidPrefix);
    this._initRegion();
    this._initRadio();
    this.initialize.apply(this, arguments);
  }
}
Application.classOptions = [
  "channelName",
  "radioEvents",
  "radioRequests",
  "region",
  "regionClass"
];
Application.extend = function (protoProps) {
  const Parent = this;
  let classProperties = {};
  for (let prop in protoProps) {
    if (typeof protoProps[prop] !== "function") {
      classProperties[prop] = protoProps[prop];
    }
  }
  class ExtendedApplication extends Parent {
    constructor(options = {}) {
      Object.assign(classProperties, options);
      super(classProperties);
    }
  }
  // Set a convenience property in case the parent"s prototype is needed later.
  ExtendedApplication.__super__ = Parent.prototype;
  // Add static properties to the constructor function, if supplied.
  Object.assign(ExtendedApplication, Parent);
  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function and add the prototype properties.
  Object.assign(ExtendedApplication.prototype, Parent.prototype, protoProps);
  ExtendedApplication.prototype.constructor = ExtendedApplication;
  return ExtendedApplication;
};
// Application Methods
// --------------
const ApplicationProto = Application.prototype;
Object.assign(Application.prototype, CommonMixin, DestroyMixin, RadioMixin);
ApplicationProto.cidPrefix = "mna";
ApplicationProto.initialize = function () {};
ApplicationProto.start = function (options = {}) {
  this.triggerMethod("before:start", this, options);
  this.triggerMethod("start", this, options);
  return this;
};
ApplicationProto.regionClass = Region;
ApplicationProto._initRegion = function () {
  const region = this.region;
  if (!region) {
    return;
  }
  const defaults = {
    regionClass: this.regionClass
  };
  this._region = buildRegion(region, defaults);
};
ApplicationProto.getRegion = function () {
  return this._region;
};
ApplicationProto.showView = function (view, ...args) {
  const region = this.getRegion();
  region.show(view, ...args);
  return view;
};
ApplicationProto.getView = function () {
  return this.getRegion().currentView;
};

// import "./Utils/error";
const proxy = function (method) {
  return function (context, ...args) {
    return method.apply(context, args);
  };
};
// Object.assign(View.prototype, ViewElementMixin, BaseViewMixin);
Object.assign(Region.prototype, RegionElementMixin);
// Object.assign(View.prototype, ViewRenderMixin);
Object.assign(
  Region.prototype,
  RegionRemoveViewMixin,
  RegionDestroyMixin,
  RegionDetachViewMixin
);
Object.assign(View.prototype, ViewRegionMixin);
Object.assign(Region.prototype, RegionShowViewMixin);
Object.assign(
  CollectionView.prototype,
  CollectionViewCollectionEventsMixin,
  CollectionViewChildContainerMixin,
  CollectionViewEmptyViewMixin,
  CollectionViewAddChildViewsMixin,
  CollectionViewRenderChildViewsMixin,
  CollectionViewDetachChildViewsMixin,
  CollectionViewRemoveChildViewsMixin,
  CollectionViewSortMixin,
  CollectionViewFilterMixin,
  CollectionViewGetChildViewMixin
);
// Utilities
const bindEvents = proxy(_bindEvents);
const unbindEvents = proxy(_unbindEvents);
const bindRequests = proxy(_bindRequests);
const unbindRequests = proxy(_unbindRequests);
const mergeOptions = proxy(mergeOptions$1);
const getOption = proxy(getOptions);
const normalizeMethods = proxy(normalizeMethods$1);
const triggerMethod = proxy(triggerMethod$1);
// Configuration
const setDomApi = function (mixin) {
  CollectionView.setDomApi(mixin);
  Region.setDomApi(mixin);
  View.setDomApi(mixin);
};
const setRenderer = function (renderer) {
  CollectionView.setRenderer(renderer);
  View.setRenderer(renderer);
};

export {
  $Dom,
  $dom,
  Application,
  Behavior,
  BrowserHistoryInstance as BrowserHistory,
  Collection,
  CollectionView,
  EventMixin,
  Manager,
  Model,
  Radio,
  Region,
  Router,
  VDom,
  View,
  _,
  bindEvents,
  bindRequests,
  getOption,
  mergeOptions,
  normalizeMethods,
  setDomApi,
  setRenderer,
  triggerMethod,
  unbindEvents,
  unbindRequests
};
