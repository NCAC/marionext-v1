// Region
// ------

import { _ } from "marionext-lodash";
import { $dom, $Dom } from "marionext-dom";
import { MnError } from "./Utils/error";

import { CommonMixin } from "./Common/Common.mixin";
import { RegionRemoveViewMixin } from "./Region/Region-removeView.mixin";
import { RegionDestroyMixin } from "./Region/Region-destroy.mixin";
import { RegionDetachViewMixin } from "./Region/Region-detachView.mixin";
import { RegionShowViewMixin } from "./Region/Region-showView.mixin";
import { RegionElementMixin } from "./Region/Region-element.mixin";

import { VDom } from "marionext-vdom";
import { tSetRenderer, setRenderer } from "./config/renderer";

interface Region
  extends CommonMixin,
    RegionRemoveViewMixin,
    RegionDestroyMixin,
    RegionDetachViewMixin,
    RegionShowViewMixin,
    RegionElementMixin {
  extend(properties: any, classProperties?: any): any;
  setDomApi: VDom.tSetDomApi;
  setRenderer: tSetRenderer;
  Dom: typeof VDom.DomApi;
  cidPrefix: string;
  cid: string;
  replaceElement: boolean;
  allowMissingEl: boolean;
  parentEl: any; // TODO must precise this
  _isReplaced: boolean;
  _isSwappingView: boolean;
  el: Element;
  $el: $Dom;
  _initEl: Element;
  currentView: GenericView;
  _parentView?: GenericView;
  _name: string;

  // This is a noop method intended to be overridden
  initialize(): void;
}

class Region {
  static classOptions = ["allowMissingEl", "parentEl", "replaceElement"];
  static extend = function (this: typeof Region, protoProps: ObjectHash) {
    const Parent: typeof Region = this;
    let classProperties = {};

    for (let prop in protoProps) {
      if (typeof protoProps[prop] !== "function") {
        classProperties[prop] = protoProps[prop];
      }
    }

    class ExtendedRegion extends Parent {
      static __super__ = Parent.prototype;
      constructor(options = {}) {
        Object.assign(classProperties, options);
        super(classProperties);
      }
    }

    // Add static properties to the constructor function, if supplied.
    Object.assign(ExtendedRegion, Parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    Object.assign(ExtendedRegion.prototype, Parent.prototype, protoProps);
    ExtendedRegion.prototype.constructor = ExtendedRegion;

    // Set a convenience property in case the parent"s prototype is needed
    // later.
    ExtendedRegion.__super__ = Parent.prototype;

    return ExtendedRegion as any;
  };
  static setDomApi = VDom.setDomApi;
  static setRenderer = setRenderer;
  constructor(options?: ObjectHash) {
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

let RegionProto = Region.prototype;
Object.assign(Region.prototype, CommonMixin);

RegionProto.cidPrefix = "mnr";
RegionProto.Dom = VDom.DomApi;
RegionProto.replaceElement = false;
RegionProto._isReplaced = false;
RegionProto._isSwappingView = false;

interface Region {
  // Check to see if the region's el was replaced.
  isReplaced(): boolean;

  // Check to see if a view is being swapped by another
  isSwappingView(): boolean;
}
RegionProto.isReplaced = function (this: Region) {
  return !!this._isReplaced;
};
RegionProto.isSwappingView = function (this: Region) {
  return !!this._isSwappingView;
};

export { Region };
