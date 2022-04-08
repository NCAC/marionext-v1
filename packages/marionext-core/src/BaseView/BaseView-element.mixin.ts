// ElementMixin
//  ---------
import { View } from "../View";
import { Model } from "marionext-data";
import { _ } from "marionext-lodash";
import { $Dom } from "marionext-dom";

interface ElementMixin {
  el?: HTMLElement;
  $el?: $Dom;
  $: typeof $Dom.prototype.init;
  className?: string;

  tagName: string;
  id?: string;

  // Ensure that the View has a DOM element to render into.
  // If `this.el` is a string, pass it through `$()`, take the first
  // matching element, and re-assign it to `el`. Otherwise, create
  // an element from the `id`, `className` and `tagName` properties.
  _ensureElement(): void;

  // Handle destroying the view and its children.
  destroy(options?: any): any;

  // Equates to this.$el.remove
  _removeElement(): void;
}

const ElementMixin: ElementMixin = {
  // The default `tagName` of a View's element is `"div"`.
  tagName: "div",
  $: function (selector) {
    return this.$el.find(selector);
  },

  /*

  // Remove this view by taking the element out of the DOM, and removing any
  // applicable Events listeners.
  remove: function () {
    this._removeElement();
    this.stopListening();
    return this;
  },

  // Remove this view's element from the document and all event listeners
  // attached to it. Exposed for subclasses using an alternative DOM
  // manipulation API.
  _removeElement: function () {
    this.$el.remove();
  },

 */
  _ensureElement(this: View<Model>) {
    if (!this.el) {
      var attrs = Object.assign({}, _.result(this, "attributes"));
      if (this.id) attrs["id"] = _.result(this, "id");
      if (this.className) attrs["class"] = _.result(this, "className");
      this.setElement(this._createElement(_.result(this, "tagName")));
      this._setAttributes(attrs);
    } else {
      this.setElement(_.result(this, "el"));
    }
  },

  // Handle destroying the view and its children.
  destroy(this: View<Model>, options) {
    if (this._isDestroyed) {
      return this;
    }
    const shouldTriggerDetach = this._isAttached && !this._disableDetachEvents;

    this.triggerMethod("before:destroy", this, options);
    if (shouldTriggerDetach) {
      this.triggerMethod("before:detach", this);
    }

    // unbind UI elements
    this.unbindUIElements();

    // remove the view from the DOM
    this._removeElement();

    if (shouldTriggerDetach) {
      this._isAttached = false;
      this.triggerMethod("detach", this);
    }

    // remove children after the remove to prevent extra paints
    this._removeChildren();

    this._isDestroyed = true;
    this._isRendered = false;

    // Destroy behaviors after _isDestroyed flag
    this._destroyBehaviors(options);

    this._deleteEntityEventHandlers();

    this.triggerMethod("destroy", this, options);
    this._triggerEventOnBehaviors("destroy", this, options);

    this.stopListening();

    return this;
  },

  _removeElement(this: View<Model>) {
    this.$el.off();
    this.Dom.detachEl(this.el, this.$el);
  }
};

export { ElementMixin };
