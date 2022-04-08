// ViewMixin
//  ---------

import { _ } from "marionext-lodash";
import { $Dom, EventCallback } from "marionext-dom";
import { EventMixin } from "marionext-event";
import { Behavior } from "../Behavior";

import { BehaviorsMixin } from "./BaseView-behaviors.mixin";
import { CommonMixin } from "../Common/Common.mixin";
import { DelegateEntityEventsMixin } from "./BaseView-delegateEntityEvents.mixin";
import { TemplateRenderMixin } from "./BaseView-templateRender.mixin";
import { TriggersMixin } from "./BaseView-triggers.mixin";
import { ElementMixin } from "./BaseView-element.mixin";
import { UIMixin } from "./BaseView-ui.mixin";
import { isEnabled } from "../config/features";
import { VDom } from "marionext-vdom";

declare global {
  interface BaseViewRegionInterface {
    regions: {} | ObjectHash;
    _regions: {} | ObjectHash;
  }
}
// ViewMixinOptions
// - behaviors
// - childViewEventPrefix
// - childViewEvents
// - childViewTriggers
// - collectionEvents
// - modelEvents
// - triggers
// - ui
export interface BaseViewMixinOptions {
  // Behavior objects to assign to this View.
  behaviors?: Behavior[];

  // Customize the event prefix for events that are forwarded through the
  // collection view.
  childViewEventPrefix?: string | false;

  //  Use the childViewEvents attribute to map child events to methods on the
  //  parent view.
  childViewEvents?: EventMap;

  // A childViewTriggers hash or method permits proxying of child view events
  // without manually setting bindings. The values of the hash should be a
  // string of the event to trigger on the parent.
  childViewTriggers?: EventMap;

  // Bind to events that occur on attached collections.
  collectionEvents?: EventMap;

  // Bind to events that occur on attached models.
  modelEvents?: EventMap;

  // The view triggers attribute binds DOM events to Marionette View events
  // that can be responded to at the view or parent level.
  triggers?: EventMap;

  // Name parts of your template to be used
  // throughout the view with the ui attribute.
  ui?: StringHash;
}

interface BaseViewMixin
  extends EventMixin,
    BehaviorsMixin,
    CommonMixin,
    DelegateEntityEventsMixin,
    TemplateRenderMixin,
    TriggersMixin,
    UIMixin,
    ElementMixin {
  Dom: typeof VDom.DomApi;

  supportsRenderLifecycle: boolean;
  supportsDestroyLifecycle: boolean;

  _isDestroyed: boolean;

  isDestroyed(): boolean;

  _isRendered: boolean;

  isRendered(): boolean;

  _isAttached: boolean;

  isAttached(): boolean;

  monitorViewEvents: boolean;

  _areViewEventsMonitored: boolean;

  _disableDetachEvents: boolean;

  _childViewEvents: ObjectHash;
  _childViewTriggers: ObjectHash;

  _eventPrefix: string | boolean;

  // el: Element;
  // $el: $Dom;
  // className?: string;

  // tagName: string;
  // id?: string;

  // Ensure that the View has a DOM element to render into.
  // If `this.el` is a string, pass it through `$()`, take the first
  // matching element, and re-assign it to `el`. Otherwise, create
  // an element from the `id`, `className` and `tagName` properties.
  _ensureElement(): void;

  // A finer-grained `undelegateEvents` for removing a single delegated event.
  // `selector` and `listener` are both optional.
  undelegateEvents(): void;

  undelegate(eventName: string, selector?: string, listener?: any);

  // Add a single event listener to the view's element (or a child element
  // using `selector`). This only works for delegate-able events: not `focus`,
  // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
  delegate(eventName: string, selector: string, listener: any): BaseView;

  // set `events` and `triggers` to internal _delegateEvents()
  delegateEvents(events?: any): any;

  _delegateEvents(events: any): any;

  // Allows View events to utilize `@ui.` selectors
  _getEvents(events): EventMap;

  // Configure `triggers` to forward DOM events to view
  // events. `triggers: {"click .foo": "do:foo"}`
  _getTriggers(): EventMap;

  // Handle `modelEvents`, and `collectionEvents` configuration
  delegateEntityEvents(): void;

  // Handle unbinding `modelEvents`, and `collectionEvents` configuration
  undelegateEntityEvents(): void;

  // Remove this view by taking the element out of the DOM, and removing any
  // applicable Backbone.Events listeners.
  remove(): void;

  // This method binds the elements specified in the "ui" hash
  bindUIElements(): any;

  // This method unbinds the elements specified in the "ui" hash
  unbindUIElements(): any;

  getUI(name: string): $Dom;

  _buildEventProxies(): void;

  _getEventPrefix(): boolean | string;

  _proxyChildViewEvents(view: GenericView): void;

  _childViewEventHandler(eventName: string, ...args): void;

  _behaviors: Behavior[];
}

const BaseViewMixin: BaseViewMixin = Object.assign(
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
    _ensureElement(this: BaseView) {
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
    delegateEvents(this: GenericView, events) {
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

    _delegateEvents(this: GenericView, events) {
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
    delegate: function (
      this: GenericView,
      eventName: string,
      selector: string,
      listener: EventCallback
    ) {
      const onEventParams: $DomEventsOnParams = { delegate: selector };
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
    undelegateEvents(this: GenericView) {
      if (this.$el) this.$el.off(".delegateEvents" + this.cid);
      return this;
    },

    // A finer-grained `undelegateEvents` for removing a single delegated event.
    // `selector` and `listener` are both optional.
    undelegate(this: GenericView, eventName: string, listener: EventCallback) {
      this.$el.off(`${eventName}.delegateEvents${this.cid}`, listener);
      return this;
    },

    // Allows View events to utilize `@ui.` selectors
    _getEvents(this: GenericView, events?: any) {
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
    delegateEntityEvents(this: GenericView) {
      this._delegateEntityEvents(this.model, this.collection);

      // bind each behaviors model and collection events
      this._delegateBehaviorEntityEvents();

      return this;
    },

    // Handle unbinding `modelEvents`, and `collectionEvents` configuration
    undelegateEntityEvents(this: GenericView) {
      this._undelegateEntityEvents(this.model, this.collection);

      // unbind each behaviors model and collection events
      this._undelegateBehaviorEntityEvents();

      return this;
    },

    // This method binds the elements specified in the "ui" hash
    bindUIElements(this: GenericView) {
      this._bindUIElements();
      this._bindBehaviorUIElements();

      return this;
    },

    // This method unbinds the elements specified in the "ui" hash
    unbindUIElements(this: GenericView) {
      this._unbindUIElements();
      this._unbindBehaviorUIElements();

      return this;
    },

    getUI(this: GenericView, name: string) {
      return this._getUI(name);
    },

    // Cache `childViewEvents` and `childViewTriggers`
    _buildEventProxies(this: BaseView) {
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

    _proxyChildViewEvents(view: GenericView) {
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

export { BaseViewMixin };
