/**
 * -------------
 * Manager
 * previously named "Object" | MnObject in Backbone.Marionette
 * `Manager`is a better name since more explicit and manifest : an object totally unbound of the DOM which serves as organizer between the components
 */

import { _ } from "marionext-lodash";
import { CommonMixin } from "./Common/Common.mixin";
import { DestroyMixin } from "./Common/Common-destroy.mixin";
import { RadioMixin } from "./Common/Common-radio.mixin";

interface Manager extends CommonMixin, DestroyMixin, RadioMixin {
  extend(protoProps?: ObjectHash): Manager;
  cidPrefix: string;
  cid: string;
  initialize(): void;
}

// Manager borrows many conventions and utilities from Marionette.
class Manager {
  static extend = function (
    this: typeof Manager,
    protoProps: ObjectHash
  ) {
    const Parent: typeof Manager = this;
    let classProperties = {};
  
    for (let prop in protoProps) {
      if (typeof protoProps[prop] !== "function") {
        classProperties[prop] = protoProps[prop];
      }
    }
  
    class ExtendedManager extends Parent {
      // Set a convenience property in case the parent"s prototype is needed later.
      static __super__ = Parent.prototype;
      constructor(options = {}) {
        Object.assign(classProperties, options);
        super(classProperties);
      }
    }
  
    // Add static properties to the constructor function, if supplied.
    Object.assign(ExtendedManager, Parent);
  
    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    Object.assign(ExtendedManager.prototype, Parent.prototype, protoProps);
    ExtendedManager.prototype.constructor = ExtendedManager;
  
    return ExtendedManager as any;
  };

  constructor(options?: object) {
    this._setOptions(options, ["channelName", "radioEvents", "radioRequests"]);
    this.cid = _.uniqueId(this.cidPrefix);
    this._initRadio();
    this.initialize.apply(this, arguments);
  }
}

// Object Methods
// --------------
let MarionetteObjectProto = Manager.prototype;
Object.assign(Manager.prototype, CommonMixin, DestroyMixin, RadioMixin);
MarionetteObjectProto.cidPrefix = "mno";
MarionetteObjectProto.initialize = function () { };

export { Manager };
