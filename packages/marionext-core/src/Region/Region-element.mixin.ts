import { _ } from "marionext-lodash";
import { Region } from "../Region";
import { MnError } from "../Utils/error";

interface RegionElementMixin {
  // Override this method to change how the region finds the DOM element that it manages. Return
  // a $dom selector object scoped to a provided parent el or the document if none exists.
  getEl(el: Element): any;
  _ensureElement(options?: ObjectHash): boolean;

  // always restore the el to ensure the regions el is present before replacing
  _replaceEl(view: GenericView): void;

  // Restore the region's element in the DOM.
  _restoreEl(): void;
}

const RegionElementMixin: RegionElementMixin = {
  getEl(this: Region, el) {
    const context = _.result(this, "parentEl");

    if (context && _.isString(el)) {
      return this.Dom.findEl(context as Element, el);
    }

    return this.Dom.getEl(el);
  },
  _ensureElement(this: Region, options = {}) {
    if (!_.isObject(this.el)) {
      this.$el = this.getEl(this.el);
      this.el = this.$el[0];
      // Make sure the $el contains only the el
      this.$el = this.Dom.getEl(this.el);
    }

    if (!this.$el || this.$el.length === 0) {
      const allowMissingEl =
        typeof options.allowMissingEl === "undefined"
          ? !!_.result(this, "allowMissingEl")
          : !!options.allowMissingEl;

      if (allowMissingEl) {
        return false;
      } else {
        throw new MnError({
          name: "RegioNError",
          message: `An "el" must exist in DOM for this region ${this.cid}`
        });
      }
    }
    return true;
  },
  _replaceEl(this: Region, view) {
    this._restoreEl();

    view.on("before:destroy", this._restoreEl, this);

    this.Dom.replaceEl(view.el, this.el);

    this._isReplaced = true;
  },
  _restoreEl(this: Region) {
    // There is nothing to replace
    if (!this._isReplaced) {
      return;
    }

    const view = this.currentView;

    if (!view) {
      return;
    }

    this._detachView(view);

    this._isReplaced = false;
  }
};

export { RegionElementMixin };
