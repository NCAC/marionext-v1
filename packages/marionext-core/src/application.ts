// Application
// -----------

import { _ } from "marionext-lodash";

import { buildRegion } from "./View/View-buildRegion.function";
import { CommonMixin } from "./Common/Common.mixin";
import { DestroyMixin } from "./Common/Common-destroy.mixin";
import { RadioMixin } from "./Common/Common-radio.mixin";
import { Region } from "./Region";

interface Application extends CommonMixin, DestroyMixin, RadioMixin {
  cid: string;
  cidPrefix: string;
  // This is a noop method intended to be overridden
  initialize(): void;
}

class Application {
  static classOptions = [
    "channelName",
    "radioEvents",
    "radioRequests",
    "region",
    "regionClass"
  ];
  static extend = function (
    this: typeof Application,
    protoProps: ObjectHash
  ) {
    const Parent: typeof Application = this;
    let classProperties = {};
  
    for (let prop in protoProps) {
      if (typeof protoProps[prop] !== "function") {
        classProperties[prop] = protoProps[prop];
      }
    }
  
    class ExtendedApplication extends Parent {
      // Set a convenience property in case the parent"s prototype is needed later.
      static __super__ = Parent.prototype;
      constructor(options = {}) {
        Object.assign(classProperties, options);
        super(classProperties);
      }
    }
  
    // Add static properties to the constructor function, if supplied.
    Object.assign(ExtendedApplication, Parent);
  
    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    Object.assign(ExtendedApplication.prototype, Parent.prototype, protoProps);
    ExtendedApplication.prototype.constructor = ExtendedApplication;
  
    return ExtendedApplication as any;
  };
  constructor(options: ObjectHash = {}) {
    this._setOptions(options, Application.classOptions);
    this.cid = _.uniqueId(this.cidPrefix);
    this._initRegion();
    this._initRadio();
    this.initialize.apply(this, arguments);
  }
}

// Application Methods
// --------------
const ApplicationProto = Application.prototype;
Object.assign(Application.prototype, CommonMixin, DestroyMixin, RadioMixin);
ApplicationProto.cidPrefix = "mna";
ApplicationProto.initialize = function () { };

interface Application {
  // Kick off all of the application's processes.
  start(options?: ObjectHash): Application;
  regionClass: typeof Region;
  region: string;
  _region: Region;
  _initRegion(): void;
  getRegion(): Region;
}
ApplicationProto.start = function (this: Application, options = {}) {
  this.triggerMethod("before:start", this, options);
  this.triggerMethod("start", this, options);
  return this;
};
ApplicationProto.regionClass = Region;
ApplicationProto._initRegion = function (this: Application) {
  const region = this.region;

  if (!region) {
    return;
  }

  const defaults = {
    regionClass: this.regionClass
  };

  this._region = buildRegion(region, defaults);
};
ApplicationProto.getRegion = function (this: Application) {
  return this._region;
};

interface Application {
  showView(view: GenericView, ...args: any[]): GenericView;
  getView(): GenericView;
}
ApplicationProto.showView = function (this: Application, view, ...args) {
  const region = this.getRegion();
  region.show(view, ...args);
  return view;
};
ApplicationProto.getView = function (this: Application) {
  return this.getRegion().currentView;
};

export { Application };
