import { Region } from "../Region";

interface RegionDetachViewMixin {
  // Empties the Region without destroying the view
  // Returns the detached view
  detachView(): GenericView;
  _detachView(view: GenericView): void;

  // Destroy the current view, if there is one. If there is no current view,
  // it will detach any html inside the region's `el`.
  empty(options?: ObjectHash): Region;

  _empty(view: GenericView, shouldDestroy?: boolean): void;

  // Override this method to change how the region detaches current content
  detachHtml(): void;

  _stopChildViewEvents(view: GenericView): void;
}
const RegionDetachViewMixin: RegionDetachViewMixin = {
  detachView(this: Region) {
    const view = this.currentView;
    if (!view) {
      return;
    }
    this._empty(view);
    return view;
  },
  _detachView(this: Region, view) {
    const shouldTriggerDetach =
      view._isAttached && !this._shouldDisableMonitoring();
    const shouldRestoreEl = this._isReplaced;
    if (shouldTriggerDetach) {
      view.triggerMethod("before:detach", view);
    }

    if (shouldRestoreEl) {
      this.Dom.replaceEl(this.el, view.el);
    } else {
      this.detachHtml();
    }

    if (shouldTriggerDetach) {
      view._isAttached = false;
      view.triggerMethod("detach", view);
    }
  },
  empty(this: Region, options = { allowMissingEl: true }) {
    const view = this.currentView;

    // If there is no view in the region we should only detach current html
    if (!view) {
      if (this._ensureElement(options)) {
        this.detachHtml();
      }
      return this;
    }

    this._empty(view, true);
    return this;
  },
  _empty(this: Region, view, shouldDestroy: boolean) {
    view.off("destroy", this._empty, this);
    this.triggerMethod("before:empty", this, view);

    this._restoreEl();

    delete this.currentView;

    if (!view._isDestroyed) {
      if (shouldDestroy) {
        this.removeView(view);
      } else {
        this._detachView(view);
      }
      this._stopChildViewEvents(view);
    }

    this.triggerMethod("empty", this, view);
  },
  detachHtml(this: Region) {
    this.Dom.detachContents(this.el, this.$el);
  },
  _stopChildViewEvents(this: Region, view) {
    const parentView = this._parentView;
    if (!parentView) {
      return;
    }
    this._parentView.stopListening(view);
  }
};

export { RegionDetachViewMixin };
