import { _ } from "marionext-lodash";
import { $Dom } from "marionext-dom";

declare global {
  interface UIHash {
    [key: string]: $Dom;
  }
}

interface UIMixin {
  ui?: StringHash | UIHash;
  _ui?: UIHash;
  _uiBindings?: StringHash | UIHash;

  // normalize the keys of passed hash with the views `ui` selectors.
  // `{"@ui.foo": "bar"}`
  normalizeUIKeys(hash: any, property?: any): {};

  // normalize the passed string with the views `ui` selectors.
  // `"@ui.bar"`
  normalizeUIString(uiString: string): any;

  // normalize the values of passed hash with the views `ui` selectors.
  // `{foo: "@ui.bar"}`
  normalizeUIValues(hash: ObjectHash, property: string): StringHash;

  _getUIBindings(): StringHash;

  // This method binds the elements specified in the "ui" hash inside the view's code with
  // the associated $dom selectors.
  _bindUIElements(): void;
  _unbindUIElements(): void;

  _getUI(names: string): $Dom;
}

const UIMixin: UIMixin = (function () {
  const uiRegEx = /@ui\.[a-zA-Z-_$0-9]*/g;

  // allows for the use of the @ui. syntax within
  // a given key for triggers and events
  // swaps the @ui with the associated selector.
  // Returns a new, non-mutated, parsed events hash.
  const _normalizeUIKeys = function (
    hash: StringHash,
    ui: StringHash
  ): StringHash {
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
  const _normalizeUIString = function (
    uiString: string,
    ui: StringHash
  ): string {
    return uiString.replace(uiRegEx, (r) => {
      return ui[r.slice(4)];
    });
  };

  // allows for the use of the @ui. syntax within
  // a given value for regions
  // swaps the @ui with the associated selector
  const _normalizeUIValues = function (
    hash: ObjectHash,
    ui: StringHash,
    property: string
  ) {
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
    normalizeUIString: function (this: GenericView, uiString) {
      const uiBindings = this._getUIBindings();
      return _normalizeUIString(uiString, uiBindings);
    },
    normalizeUIKeys: function (this: GenericView, hash) {
      const uiBindings = this._getUIBindings();
      return _normalizeUIKeys(hash, uiBindings);
    },
    normalizeUIValues: function (this: GenericView, hash, property) {
      const uiBindings = this._getUIBindings();
      return _normalizeUIValues(hash, uiBindings, property);
    },
    _getUIBindings: function (this: GenericView) {
      const uiBindings = _.result(this, "_uiBindings");
      return uiBindings || _.result(this, "ui");
    },
    _bindUIElements: function (this: GenericView) {
      if (!this.ui) {
        return;
      }
      // store the ui hash in _uiBindings so they can be reset later
      // and so re-rendering the view will be able to find the bindings
      if (!this._uiBindings) {
        this._uiBindings = this.ui;
      }
      // get the bindings result, as a function or otherwise
      const bindings = _.result(this, "_uiBindings") as ArrayLike<any>;

      // empty the ui so we don't have anything to start with
      this._ui = {};
      // bind each of the selectors
      _.each(bindings, (selector, key) => {
        this._ui[key] = this.$(selector);
      });

      this.ui = this._ui;
    },
    _unbindUIElements: function (this: GenericView) {
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
    _getUI: function (this: GenericView, name) {
      return this._ui[name];
    }
  } as UIMixin;
})();

export { UIMixin };
