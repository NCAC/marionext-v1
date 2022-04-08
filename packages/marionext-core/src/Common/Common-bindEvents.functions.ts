// Bind Entity Events & Unbind Entity Events
// -----------------------------------------
//
// These methods are used to bind/unbind a Marionette "entity" (e.g. collection/model)
// to methods on a target object.
//
// The first parameter, `target`, must have the Marionette.Events module mixed in.
//
// The second parameter is the `entity` (Marionette.Model, Marionette.Collection or
// any object that has Marionette.Events mixed in) to bind the events from.
//
// The third parameter is a hash of { "event:name": "eventHandler" }
// configuration. Multiple handlers can be separated by a space. A
// function can be supplied instead of a string handler name.

import { normalizeBindings } from "./Common-normalizeBindings.function";

export const _bindEvents = function(entity: any, bindings: ObjectHash): any {
  if (!entity || !bindings) {
    return this;
  }

  this.listenTo(entity, normalizeBindings(this, bindings));

  return this;
};

export const _unbindEvents = function(entity: any, bindings: ObjectHash): any {
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
