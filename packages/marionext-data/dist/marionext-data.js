import { _ } from 'marionext-lodash';
import Events from 'marionext-event';

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
const extendModel = function(protoProps) {
  const Parent = this;
  let classProperties = {};
  for (let prop in protoProps) {
    if (typeof protoProps[prop] !== "function") {
      classProperties[prop] = protoProps[prop];
    }
  }
  class ExtendedModel extends Parent {
    constructor(options = {}) {
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
Model.extend = extendModel;
let ModelProto = Model.prototype;
Object.assign(Model.prototype, Events);
ModelProto.initialize = function() {};
ModelProto.validationError = null;
ModelProto.idAttribute = "id";
ModelProto.cidPrefix = "c";
ModelProto.changed = null;
ModelProto.toJSON = function(options) {
  return _.clone(this.attributes);
};
ModelProto.get = function(attr) {
  return this.attributes[attr];
};
ModelProto.escape = function(attr) {
  return _.escape(this.get(attr));
};
ModelProto.has = function(attr) {
  return this.get(attr) != null;
};
ModelProto.matches = function(attrs) {
  return _.matches(attrs)(this.attributes);
};
ModelProto.parse = function(response, options) {
  return response;
};
ModelProto.set = function(key, val, options) {
  var attrs;
  if (typeof key === "object") {
    attrs = key;
    options = val;
  } else {
    (attrs = {})[key] = val;
  }
  options || (options = {});
  // Run validation.
  if (!this._validate(attrs, options))
    return false;
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
    unset ? delete current[attr] : current[attr] = val;
  }
  // Update the `id`.
  if (this.idAttribute in attrs) {
    this.id = this.get(this.idAttribute);
  }
  // Trigger all relevant attribute changes.
  if (!silent) {
    if (changes.length)
      this._pending = options;
    for (let i = 0; i < changes.length; i++) {
      this.trigger("change:" + changes[i], this, current[changes[i]], options);
    }
  }
  // You might be wondering why there"s a `while` loop here. Changes can
  // be recursively nested within `"change"` events.
  if (changing)
    return this;
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
ModelProto.unset = function(attribute, options) {
  return this.set(attribute, void 0, Object.assign({}, options, {
    unset: true
  }));
};
ModelProto.clear = function(options) {
  let attrs = {};
  for (let key in this.attributes) {
    attrs[key] = void 0;
  }
  return this.set(attrs, Object.assign({}, options, {
    unset: true
  }));
};
ModelProto.hasChanged = function(attr) {
  if (attr == null) {
    return !_.isEmpty(this.changed);
  }
  return _.has(this.changed, attr);
};
ModelProto.hasChanged = function(attribute) {
  if (attribute == null) {
    return !_.isEmpty(this.changed);
  }
  return _.has(this.changed, attribute);
};
ModelProto.changedAttributes = function(diff) {
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
ModelProto.previous = function(attribute) {
  if (attribute == null) {
    return null;
  }
  return this._previousAttributes[attribute];
};
ModelProto.previousAttributes = function() {
  return _.clone(this._previousAttributes);
};
ModelProto.clone = function() {
  const ModelConstructor = this.constructor;
  return new ModelConstructor(this.attributes);
};
ModelProto.isValid = function(options) {
  return this._validate({}, Object.assign({}, options, {
    validate: true
  }));
};
ModelProto._validate = function(attrs, options) {
  if (!options.validate || typeof this.validate == "undefined") {
    return true;
  }
  attrs = Object.assign({}, this.attributes, attrs);
  var error = this.validationError = this.validate(attrs, options) || null;
  if (!error)
    return true;
  this.trigger("invalid", this, error, Object.assign(options, {
    validationError: error
  }));
  return false;
};
ModelProto.keys = function() {
  return Object.keys(this.attributes);
};
ModelProto.values = function() {
  return Object.keys(this.attributes).map(function(key) {
    return this.attributes[key];
  });
};
ModelProto.invert = function() {
  return _.invert(this.attributes);
};
ModelProto.pick = function() {
  var args = Array.prototype.slice.call(arguments);
  // args.unshift(this.attributes);
  // return pick.apply()
  return _.pick(this.attributes, args); // TO TEST ???
};
ModelProto.omit = function() {
  var args = Array.prototype.slice.call(arguments);
  return _.omit(this.attributes, args);
};
ModelProto.isEmpty = function() {
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
const _invoke = _.invokeMap || _.invoke;

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
const setOptions = {
  add: true,
  remove: true,
  merge: true
};
const addOptions = {
  add: true,
  remove: false
};
const makeCollectionIterator = (function() {
  const modelMatcher = function modelMatcher(attrs) {
    var matcher = _.matches(attrs);
    return function(model) {
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
      return function(model) {
        return model.get(iteratee);
      };
    }
    return iteratee;
  };
}());
const extendCollection = function(protoProps) {
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
      this.reset(models, Object.assign({
        silent: true
      }, options));
    }
  }
}
Collection.extend = extendCollection;
let CollectionProto = Collection.prototype;
Object.assign(Collection.prototype, Events);
CollectionProto._reset = function() {
  this.length = 0;
  this.models = [];
  this._byId = {};
};
CollectionProto.model = Model;
CollectionProto.preinitialize = function() {};
CollectionProto.initialize = function() {};
CollectionProto.toJSON = function(options) {
  return this.map(function(model) {
    return model.toJSON(options);
  });
};
CollectionProto.add = function(models, options) {
  return this.set(models, Object.assign({
    merge: false
  }, options, addOptions));
};
CollectionProto.remove = function(models, options) {
  options = Object.assign({}, options);
  const singular = !(Array.isArray(models));
  if (Array.isArray(models)) {
    models = models.slice();
  } else {
    models = [models];
  }
  var removed = this._removeModels(models, options);
  if (!options.silent && removed.length) {
    options.changes = {
      added: [],
      merged: [],
      removed: removed
    };
    this.trigger('update', this, options);
  }
  return singular ? removed[0] : removed;
};
CollectionProto.parse = function(response, options) {
  return response;
};
CollectionProto.set = function(models, options) {
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
        if (options.parse)
          attrs = existing.parse(attrs, options);
        existing.set(attrs, options);
        toMerge.push(existing);
        if (sortable && !sort)
          sort = existing.hasChanged(sortAttr);
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
      if (!modelMap[model.cid])
        toRemove.push(model);
    }
    if (toRemove.length) {
      this._removeModels(toRemove, options);
    }
  }
  // See if sorting is needed, update `length` and splice in new models.
  var orderChanged = false;
  var replace = !sortable && add && remove;
  if (set.length && replace) {
    orderChanged = this.length !== set.length || Array.prototype.some.call(this.models, function(m, index) {
      return m !== set[index];
    });
    this.models.length = 0;
    splice(this.models, set, 0);
    this.length = this.models.length;
  } else if (toAdd.length) {
    if (sortable)
      sort = true;
    splice(this.models, toAdd, at == null ? this.length : at);
    this.length = this.models.length;
  }
  // Silently sort the collection if appropriate.
  if (sort)
    this.sort({
      silent: true
    });
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
CollectionProto.reset = function(models, options) {
  let _options = options ? _.clone(options) : {};
  for (let i = 0; i < this.models.length; i++) {
    this._removeReference(this.models[i], options);
  }
  _options.previousModels = this.models;
  this._reset();
  models = this.add(models, Object.assign({
    silent: true
  }, options));
  if (!options.silent) {
    this.trigger("reset", this, options);
  }
  return models;
};
CollectionProto.push = function(model, options) {
  return this.add(model, Object.assign({
    at: this.length
  }, options));
};
CollectionProto.pop = function(options) {
  var model = this.at(this.length - 1);
  return this.remove(model, options);
};
CollectionProto.unshift = function(model, options) {
  return this.add(model, Object.assign({
    at: 0
  }, options));
};
CollectionProto.shift = function(options) {
  var model = this.at(0);
  return this.remove(model, options);
};
CollectionProto.slice = function(min, max) {
  // return Array.prototype.slice.apply(this.models, arguments);.
  return this.models.slice(min, max);
};
CollectionProto.get = function(obj) {
  if (obj == null)
    return void 0;
  return this._byId[obj] ||
    this._byId[this.modelId(obj.attributes || obj)] ||
    obj.cid && this._byId[obj.cid];
};
CollectionProto.has = function(obj) {
  return this.get(obj) != null;
};
CollectionProto.at = function(index) {
  if (index < 0)
    index += this.length;
  return this.models[index];
};
// Return models with matching attributes. Useful for simple cases of
// `filter`.
CollectionProto.where = function(attrs, first) {
  if (first) {
    return this.find(attrs);
  } else {
    return this.filter(attrs);
  }
};
CollectionProto.findWhere = function(attrs) {
  return this.where(attrs, true);
};
CollectionProto.sort = function(options) {
  var comparator = this.comparator;
  if (!comparator)
    throw new Error('Cannot sort a set without a comparator');
  options || (options = {});
  var length = comparator.length;
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
  if (!options.silent)
    this.trigger('sort', this, options);
  return this;
};
CollectionProto.pluck = function(attr) {
  return this.models.map(function(model) {
    return model.get("attr");
  });
};
CollectionProto.parse = function(resp, options) {
  return resp;
};
CollectionProto.clone = function() {
  return new this.constructor(this.models, {
    model: this.model,
    comparator: this.comparator
  });
};
CollectionProto.modelId = function(attrs) {
  return attrs[this.model.prototype.idAttribute || 'id'];
};
CollectionProto._reset = function() {
  this.length = 0;
  this.models = [];
  this._byId = {};
};
CollectionProto._prepareModel = function(attrs, options) {
  if (this._isModel(attrs)) {
    if (!attrs.collection)
      attrs.collection = this;
    return attrs;
  }
  options = options ? _.clone(options) : {};
  options.collection = this;
  var model = new this.model(attrs, options);
  if (!model.validationError)
    return model;
  this.trigger('invalid', this, model.validationError, options);
  return false;
};
// Internal method called by both remove and set.
CollectionProto._removeModels = function(models, options) {
  var removed = [];
  for (var i = 0; i < models.length; i++) {
    var model = this.get(models[i]);
    if (!model)
      continue;
    var index = this.indexOf(model);
    this.models.splice(index, 1);
    this.length--;
    // Remove references before triggering 'remove' event to prevent an
    // infinite loop. #3693
    delete this._byId[model.cid];
    var id = this.modelId(model.attributes);
    if (id != null)
      delete this._byId[id];
    if (!options.silent) {
      options.index = index;
      model.trigger('remove', model, this, options);
    }
    removed.push(model);
    this._removeReference(model, options);
  }
  return removed;
};
CollectionProto._isModel = function(model) {
  return model instanceof Model;
};
CollectionProto._addReference = function(model) {
  this._byId[model.cid] = model;
  var id = this.modelId(model.attributes);
  if (id != null)
    this._byId[id] = model;
  model.on('all', this._onModelEvent, this);
};
CollectionProto._removeReference = function(model, options) {
  delete this._byId[model.cid];
  var id = this.modelId(model.attributes);
  if (id != null)
    delete this._byId[id];
  if (this === model.collection)
    delete model.collection;
  model.off('all', this._onModelEvent, this);
};
CollectionProto._onModelEvent = function(event, model, collection, options) {
  if (model) {
    if ((event === 'add' || event === 'remove') && collection !== this)
      return;
    if (event === 'destroy')
      this.remove(model, options);
    if (event === 'change') {
      var prevId = this.modelId(model.previousAttributes());
      var id = this.modelId(model.attributes);
      if (prevId !== id) {
        if (prevId != null)
          delete this._byId[prevId];
        if (id != null)
          this._byId[id] = model;
      }
    }
  }
  this.trigger.apply(this, arguments);
};
CollectionProto.sortBy = function(key, sort = "asc") {
  const ascending = ("asc" === sort);
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
    return this.models.sort(function(ModelA, ModelB) {
      if (ModelA.get(key) < ModelB.get(key)) {
        return ascending ? -1 : -1;
      } else if (ModelA.get(key) > ModelB.get(key)) {
        return ascending ? 1 : -1;
      } else {
        return 0;
      }
    });
  } else {
    return this.models.sort(function(ModelA, ModelB) {
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
CollectionProto.forEach = function(iterator) {
  this.models.forEach(iterator);
};
CollectionProto.indexOf = function(value, from) {
  return this.models.indexOf(value, from);
};
CollectionProto.lastIndexOf = function(value, from) {
  return this.models.lastIndexOf(value, from);
};
CollectionProto.findIndex = function(predicate) {
  return this.models.findIndex(makeCollectionIterator(predicate, this));
};
CollectionProto.filter = function(predicate) {
  return this.models.filter(makeCollectionIterator(predicate, this));
};
CollectionProto.find = function(predicate) {
  return this.models.find(makeCollectionIterator(predicate, this));
};
CollectionProto.size = function() {
  return this.models.length + 1;
};
CollectionProto.first = function(n) {
  if (!n) {
    return this.models[0];
  } else {
    return this.models.slice(0, n);
  }
};
CollectionProto.some = function(predicate) {
  return this.models.some(makeCollectionIterator(predicate, this));
};
CollectionProto.every = function(predicate) {
  return this.models.every(makeCollectionIterator(predicate, this));
};
CollectionProto.contains = function(value) {
  return this.models.includes(value);
};
CollectionProto.shuffle = function() {
  return _.shuffle(this.models);
};
CollectionProto.isEmpty = function() {
  return this.models.length > 0;
};
CollectionProto.countBy = function(predicate) {
  return _.countBy(this.models, makeCollectionIterator(predicate, this));
};
CollectionProto.groupBy = function(predicate) {
  return _.groupBy(this.models, makeCollectionIterator(predicate, this));
};
CollectionProto.map = function(iterator) {
  return this.models.map(iterator);
};
CollectionProto.sample = function() {
  return _.sample(this.models);
};

export {
  Model,
  Collection
};