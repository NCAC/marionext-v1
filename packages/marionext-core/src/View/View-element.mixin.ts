import { $dom } from "marionext-dom";

interface ViewElementMixin {
  // Change the view's element (`this.el` property) and re-delegate the
  // view's events on the new element.
  setElement(element): GenericView;

  // Creates the `this.el` and `this.$el` references for this view using the
  // given `el`. `el` can be a CSS selector or an HTML string, a $Dom
  // context or an element. Subclasses can override this to utilize an
  // alternative DOM manipulation API and are only required to set the
  // `this.el` property.
  _setElement(el: any): void;

  // Remove this view's element from the document and all event listeners
  // attached to it. Exposed for subclasses using an alternative DOM
  // manipulation API.
  _removeElement(): void;

  // Produces a DOM element to be assigned to your view. Exposed for
  // subclasses using an alternative DOM manipulation API.
  _createElement(tagName: string): Element;
}

const ViewElementMixin: ViewElementMixin = {
  setElement(this: BaseView, element) {
    this.undelegateEvents();
    this._setElement(element);
    this.delegateEvents();
    this._isRendered = this.Dom.hasContents(this.el);
    this._isAttached = this.Dom.hasEl(document.documentElement, this.el);

    if (this._isRendered) {
      this.bindUIElements();
    }

    return this;
  },

  _setElement(this: GenericView, el: any) {
    this.$el = $dom.is$Dom(el) ? el : $dom(el);
    this.el = this.$el[0];
  },

  _removeElement(this: GenericView) {
    this.$el.remove();
  },

  _createElement(this: GenericView, tagName) {
    return document.createElement(tagName);
  }
};

export { ViewElementMixin };
