import { _ } from "marionext-lodash";
import { Collection } from "./Collection";
import { EventMixin } from "marionext-event";

/**
 * Model
 * --------------
 */
/**
 * Marionette **Models** are the basic data object in the framework --
 * frequently representing a row in a table in a database on your server.
 * A discrete chunk of data and a bunch of useful, related methods for
 * performing computations and transformations on that data.
 *
 * Create a new model with the specified attributes. A client id (`cid`)
 * is automatically generated and assigned for you.
 */


declare interface Model extends EventMixin {
  extend(properties: any, classProperties?: any): any;
  // The prefix is used to create the client id which is used to identify models locally.
  // You may want to override this if you"re experiencing name clashes with model ids.
  cidPrefix: string;
  cid: string;
  attributes: ObjectHash;
  _previousAttributes: ObjectHash;
  collection?: Collection<any>; // Collection<any> but avoid circular dependency here, merge interface Model in marionext with correct type

  // A hash of attributes whose current and previous value differ.
  changed: any;
  _pending: boolean;
  _changing: boolean;
}
class Model {
  static extend = function (
    this: typeof Model,
    protoProps: ObjectHash
  ) {
    const Parent: typeof Model = this;
    let classProperties = {};
  
    for (let prop in protoProps) {
      if (typeof protoProps[prop] !== "function") {
        classProperties[prop] = protoProps[prop];
      }
    }
  
    class ExtendedModel extends Parent {
      static __super__ = Parent.prototype;
      constructor(options = {}) {
        // for Behavior class, we need the view argument
        Object.assign(classProperties, options);
        super(classProperties);
      }
    }
  
    // Add static properties to the constructor function, if supplied.
    Object.assign(ExtendedModel, Parent);
  
    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    Object.assign(ExtendedModel.prototype, Parent.prototype, protoProps);
    ExtendedModel.prototype.constructor = ExtendedModel;
  
    // Set a convenience property in case the parent"s prototype is needed
    // later.
    ExtendedModel.__super__ = Parent.prototype;
  
    return ExtendedModel as any;
  };
  constructor(attributes: ObjectHash = {}, options: ObjectHash = {}) {
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

let ModelProto = Model.prototype;
Object.assign(Model.prototype, EventMixin);

interface Model {
  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize(): void;
}
ModelProto.initialize = function () { };

interface Model {
  /**
   * Default attributes for the model. It can be an object hash or a method returning an object hash.
   * For assigning an object hash, do it like this: this.defaults = <any>{ attribute: value, ... };
   * That works only if you set it in the constructor or the initialize method.
   **/
  defaults(): ObjectHash;
  id: any;

  // The default name for the JSON `id` attribute is `"id"`. MongoDB and
  // CouchDB users may want to set this to `"_id"`.
  idAttribute: string;

  // The value returned during the last failed validation.
  validationError: any;
}
ModelProto.validationError = null;
ModelProto.idAttribute = "id";
ModelProto.cidPrefix = "c";
ModelProto.changed = null;

interface Model {
  toJSON(options?: any): ObjectHash;
}
ModelProto.toJSON = function (this: Model, options) {
  return _.clone(this.attributes);
};

interface Model {
  get(attr: string): any;
}
ModelProto.get = function (this: Model, attr) {
  return this.attributes[attr];
};

interface Model {
  // Get the HTML-escaped value of an attribute.
  escape(attr: string): string;
}
ModelProto.escape = function (this: Model, attr) {
  return _.escape(this.get(attr));
};

interface Model {
  // Returns `true` if the attribute contains a value that is not null
  // or undefined.
  has(attr: string): boolean;
}
ModelProto.has = function (this: Model, attr) {
  return this.get(attr) != null;
};

interface Model {
  matches(attrs: string | ObjectHash): boolean;
}
ModelProto.matches = function (this: Model, attrs) {
  return _.matches(attrs)(this.attributes);
};

interface Model {
  // **parse** converts a response into the hash of attributes to be `set` on
  // the model. The default implementation is just to pass the response along.
  parse(response: any, options?: any): any;
}
ModelProto.parse = function (response, options) {
  return response;
};

interface Model {
  // Set a hash of model attributes on the object, firing `"change"`. This is
  // the core primitive operation of a model, updating the data and notifying
  // anyone who needs to know about the change in state. The heart of the beast.
  // set(obj: any, options?: ModelSetOptions): Model | boolean;
  // set(attributeName: string, value: any, options?: ModelSetOptions): Model | boolean;
  set(key: string | object, val?: any, options?: any): Model | boolean;

  // Remove an attribute from the model, firing `"change"`. `unset` is a noop
  // if the attribute doesn"t exist.
  unset(attribute: string, options?: Silenceable): Model;
}
ModelProto.set = function (this: Model, key: any, val?: any, options?: any) {
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
ModelProto.unset = function (this: Model, attribute: string, options) {
  return this.set(
    attribute,
    void 0,
    Object.assign({}, options, { unset: true })
  ) as Model;
};

interface Model {
  // Clear all attributes on the model, firing `"change"`.
  clear(options?: Silenceable): any;
}
ModelProto.clear = function (this: Model, options) {
  let attrs = {};
  for (let key in this.attributes) {
    attrs[key] = void 0;
  }
  return this.set(attrs, Object.assign({}, options, { unset: true }));
};

interface Model {
  // Determine if the model has changed since the last `"change"` event.
  // If you specify an attribute name, determine if that attribute has changed.
  hasChanged(attr?: string): boolean;
}
ModelProto.hasChanged = function (this: Model, attr) {
  if (attr == null) {
    return !_.isEmpty(this.changed);
  }
  return _.has(this.changed, attr);
};

interface Model {
  hasChanged(attribute?: string): boolean;
}
ModelProto.hasChanged = function (this: Model, attribute) {
  if (attribute == null) {
    return !_.isEmpty(this.changed);
  }
  return _.has(this.changed, attribute);
};

interface Model {
  /**
   * Return an object containing all the attributes that have changed, or
   * false if there are no changed attributes. Useful for determining what
   * parts of a view need to be updated and/or what attributes need to be
   * persisted to the server. Unset attributes will be set to undefined.
   * You can also pass an attributes object to diff against the model,
   * determining if there *would be* a change. */
  changedAttributes(diff: any): any;
}
ModelProto.changedAttributes = function (this: Model, diff) {
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

interface Model {
  // Get the previous value of an attribute, recorded at the time the last
  // `"change"` event was fired.
  previous(attribute: string): any;

  // Get all of the attributes of the model at the time of the previous
  // `"change"` event.
  previousAttributes(): ObjectHash;
}
ModelProto.previous = function (this: Model, attribute) {
  if (attribute == null) {
    return null;
  }
  return this._previousAttributes[attribute];
};
ModelProto.previousAttributes = function (this: Model) {
  return _.clone(this._previousAttributes);
};

interface Model {
  // Create a new model with identical attributes to this one.
  clone(): Model;
}
ModelProto.clone = function (this: Model) {
  const ModelConstructor = this.constructor as {
    new(attr: ObjectHash): Model;
  };
  return new ModelConstructor(this.attributes);
};

interface Model {
  // Check if the model is currently in a valid state.
  isValid(options?: any): boolean;

  // Run validation against the next complete set of model attributes,
  // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
  _validate(attributes: any, options?: any): any;

  // This method is left undefined and you're encouraged to override it
  // with any custom validation logic you have that can be performed in JavaScript.
  validate?: (attrs: ObjectHash, options?: any) => boolean;
}
ModelProto.isValid = function (this: Model, options) {
  return this._validate({}, Object.assign({}, options, { validate: true }));
};
ModelProto._validate = function (this: Model, attrs, options) {
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

interface Model {
  // mixins from lodash
  keys(): string[];
  values(): any[];
  pairs(): any[];
  invert(): any;
  pick(keys: string[]): any;
  pick(...keys: string[]): any;
  pick(fn: (value: any, key: any, object: any) => any): any;
  omit(keys: string[]): any;
  omit(...keys: string[]): any;
  omit(fn: (value: any, key: any, object: any) => any): any;
  isEmpty(): boolean;
  matches(attrs: any): boolean;
}
ModelProto.keys = function (this: Model) {
  return Object.keys(this.attributes);
};
ModelProto.values = function (this: Model) {
  return Object.keys(this.attributes).map(function (key) {
    return this.attributes[key];
  });
};
ModelProto.invert = function (this: Model) {
  return _.invert(this.attributes);
};
ModelProto.pick = function (this: Model) {
  var args = Array.prototype.slice.call(arguments);
  // args.unshift(this.attributes);
  // return pick.apply()
  return _.pick(this.attributes, args); // TO TEST ???
};
ModelProto.omit = function (this: Model) {
  var args = Array.prototype.slice.call(arguments);
  return _.omit(this.attributes, args);
};
ModelProto.isEmpty = function (this: Model) {
  return _.isEmpty(this.attributes);
};

export { Model };

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
