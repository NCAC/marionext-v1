// Behavior
// --------

// A Behavior is an isolated set of DOM /
// user interactions that can be mixed into any View.
// Behaviors allow you to blackbox View specific interactions
// into portable logical chunks, keeping your views simple and your code DRY.

import { _ } from "marionext-lodash";
import { $dom, $Dom } from "marionext-dom";

import { getNamespacedEventName } from "./Utils/Utils-functions";
import { CommonMixin } from "./Common/Common.mixin";
import { DelegateEntityEventsMixin } from "./BaseView/BaseView-delegateEntityEvents.mixin";
import { TriggersMixin } from "./BaseView/BaseView-triggers.mixin";
import { UIMixin } from "./BaseView/BaseView-ui.mixin";

import { View } from "./View";
import { Model } from "marionext-data";
import { EventMixin } from "marionext-event";

const ClassOptions = [
  "collectionEvents",
  "events",
  "modelEvents",
  "triggers",
  "ui"
];

interface Behavior
  extends CommonMixin,
    DelegateEntityEventsMixin,
    TriggersMixin,
    UIMixin,
    EventMixin {
  cidPrefix: string;
  view: View<Model>;
  cid: string;
  initialize(): void;
  $el: $Dom;
  el: Element;
  options?: any;
  events: EventMap;
  triggers: EventMap;
}

class Behavior {
  static classOptions = [
    "collectionEvents",
    "events",
    "modelEvents",
    "triggers",
    "ui"
  ];
  static extend = function (this: typeof Behavior, protoProps: ObjectHash) {
    const Parent: typeof Behavior = this;
    let classProperties = {};

    for (let prop in protoProps) {
      if (typeof protoProps[prop] !== "function") {
        classProperties[prop] = protoProps[prop];
      }
    }

    class ExtendedBehavior extends Parent {
      // Set a convenience property in case the parent"s prototype is needed later.
      static __super__ = Parent.prototype;
      constructor(options = {}, viewArg?: View<Model>) {
        // for Behavior class, we need the view argument
        Object.assign(classProperties, options);
        super(classProperties, viewArg);
      }
    }

    // Add static properties to the constructor function, if supplied.
    Object.assign(ExtendedBehavior, Parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    Object.assign(ExtendedBehavior.prototype, Parent.prototype, protoProps);
    ExtendedBehavior.prototype.constructor = ExtendedBehavior;

    return ExtendedBehavior as any;
  };
  constructor(options: ObjectHash, view: View<Model>) {
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

interface Behavior {
  // proxy behavior $ method to the view
  // this is useful for doing jquery DOM lookups
  // scoped to behaviors view.
  $(): $Dom;
}
BehaviorProto.$ = function (this: Behavior) {
  return this.view.$.apply(this.view, arguments);
};

interface Behavior {
  // Stops the behavior from listening to events.
  destroy(): Behavior;
}
BehaviorProto.destroy = function (this: Behavior) {
  this.stopListening();
  this.view._removeBehavior(this);
  this._deleteEntityEventHandlers();
  return this;
};

interface Behavior {
  proxyViewProperties(): Behavior;
}
BehaviorProto.proxyViewProperties = function (this: Behavior) {
  this.$el = this.view.$el;
  this.el = this.view.el;
  return this;
};

interface Behavior {
  bindUIElements(): Behavior;
  unbindUIElements(): Behavior;
  getUI(name: string): $Dom;
}
BehaviorProto.bindUIElements = function (this: Behavior) {
  this._bindUIElements();
  return this;
};
BehaviorProto.unbindUIElements = function (this: Behavior) {
  this._unbindUIElements();
  return this;
};
BehaviorProto.getUI = function (this: Behavior, name) {
  return this._getUI(name);
};

interface Behavior {
  // Handle `modelEvents`, and `collectionEvents` configuration
  delegateEntityEvents(): Behavior;
  undelegateEntityEvents(): Behavior;
  _getEvents(): EventMap | void;
  // Internal method to build all trigger handlers for a given behavior
  _getTriggers(): EventMap | void;
}
BehaviorProto.delegateEntityEvents = function (this: Behavior) {
  this._delegateEntityEvents(this.view.model, this.view.collection);
  return this;
};
BehaviorProto.undelegateEntityEvents = function (this: Behavior) {
  this._undelegateEntityEvents(this.view.model, this.view.collection);
  return this;
};
BehaviorProto._getEvents = function (this: Behavior) {
  if (!this.events) {
    return;
  }

  // Normalize behavior events hash to allow
  // a user to use the @ui. syntax.
  const behaviorEvents = this.normalizeUIKeys(_.result(this, "events"));

  // binds the handler to the behavior and builds a unique eventName
  return _.reduce(
    behaviorEvents,
    (events, behaviorHandler: any, key) => {
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
BehaviorProto._getTriggers = function (this: Behavior) {
  if (!this.triggers) {
    return;
  }

  // Normalize behavior triggers hash to allow
  // a user to use the @ui. syntax.
  const behaviorTriggers = this.normalizeUIKeys(_.result(this, "triggers"));

  return this._getViewTriggers(this.view, behaviorTriggers);
};

export { Behavior };
