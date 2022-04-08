import { _ } from "marionext-lodash";
import { EventMixin } from "marionext-event";

import { Model, Collection } from "marionext-data";

import { monitorViewEvents } from "./Common/Common-monitorViewEvents.function";
import { BaseViewMixin, BaseViewMixinOptions } from "./BaseView/BaseView.mixin";
import { ViewRegionMixin } from "./View/View-region.mixin";
import { ViewElementMixin } from "./View/View-element.mixin";
import { ViewRenderMixin } from "./View/View-render.mixin";
import { VDom } from "marionext-vdom";
// VDom.DomApi
import { tSetRenderer, setRenderer } from "./config/renderer";

// ViewOptions used with new View(options?: ViewOptions)
interface ViewOptions<TModel extends Model> extends BaseViewMixinOptions {
  model?: TModel;

  // TODO: quickfix, this can't be fixed easy. The collection does not need to have the same model as the parent view.
  collection?: Collection<any>; //was: Collection<TModel>;
  el?: any;
  events?: EventMap;
  id?: string;
  className?: string;
  tagName?: string;
  attributes?: { [id: string]: any };

  // If you've created a custom region class, you can use it to define
  // your region.
  regionClass?: any;

  // Add regions to this View.
  regions?: any;

  // Set the template of this View.
  template?: any;

  // The templateContext attribute can be used to add extra information to
  // your templates
  templateContext?: any;
}

// ViewProperties interface used with View.extend(props: ViewProperties)
interface ViewProperties extends ViewOptions<Model> {
  radioEvents?: StringHash;
  ui?: StringHash;
  radioRequests?: StringHash;
  initialize?: () => void;
}

interface View<TModel extends Model>
  extends EventMixin,
    BaseViewMixin,
    ViewRegionMixin,
    ViewElementMixin,
    ViewRenderMixin {
  extend: any;
  setDomApi: VDom.tSetDomApi;
  setRenderer: tSetRenderer;
  Dom: typeof VDom.DomApi;
  cid: string;
  tagName: string;
  initialize(): void;

  _setAttributes(attributes: StringHash): void;

  // called by ViewMixin destroy
  _removeChildren(): void;

  events: StringHash;
  triggers: StringHash;

  regions: {} | ObjectHash;
  _regions: {} | ObjectHash;

  model?: Model;
  collection?: Collection<Model>;
}

class View<TModel extends Model> {
  static classProperties = [
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
  static classOptions = [
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
  static extend = function (this: typeof View, protoProps: ObjectHash) {
    const Parent: typeof View = this;
    let classProperties = {};

    for (let prop in protoProps) {
      if (typeof protoProps[prop] !== "function") {
        classProperties[prop] = protoProps[prop];
      }
    }

    class ExtendedView extends Parent<Model> {
      // Set a convenience property in case the parent"s prototype is needed later.
      static __super__ = Parent.prototype;
      constructor(options = {}) {
        Object.assign(classProperties, options);
        super(classProperties);
      }
    }

    // Add static properties to the constructor function, if supplied.
    Object.assign(ExtendedView, Parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    Object.assign(ExtendedView.prototype, Parent.prototype, protoProps);
    ExtendedView.prototype.constructor = ExtendedView;

    return ExtendedView as any;
  };
  static setDomApi = VDom.setDomApi;
  static setRenderer = setRenderer;

  constructor(options?: ViewOptions<TModel>) {
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

  _setAttributes(attributes: StringHash) {
    this.$el.attr(attributes);
  }

  _removeChildren() {
    this.removeRegions();
  }
}

Object.assign(
  View.prototype,
  EventMixin,
  ViewElementMixin,
  ViewRenderMixin,
  ViewRegionMixin,
  BaseViewMixin
);

export { View, ViewOptions, ViewProperties };
