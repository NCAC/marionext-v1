import { _ } from "marionext-lodash";
import { MnError } from "../Utils/error";
import { View } from "../View";
import { CollectionView } from "../CollectionView";
import { monitorViewEvents } from "../Common/Common-monitorViewEvents.function";
import { renderView } from "../BaseView/BaseView-renderDestroy.functions";
import { Region } from "../Region";

interface RegionShowViewMixin {
  // Displays a view instance inside of the region. If necessary handles calling the `render`
  // method for you. Reads content directly from the `el` attribute.
  show(view: GenericView, options?: ObjectHash): Region;

  _getView(view: GenericView, options?: any): GenericView;

  // This allows for a template or a static string to be
  // used as a template
  _getViewOptions(viewOptions: any): any;

  _setupChildView(view: GenericView): void;

  _proxyChildViewEvents(view: GenericView): void;

  _attachView(view: GenericView, options?: ObjectHash): void;

  // Override this method to change how the new view is appended to the `$el` that the
  // region is managing
  attachHtml(view: GenericView): void;

  // Checks whether a view is currently present within the region. Returns `true` if there is
  // and `false` if no view is present.
  hasView(): boolean;
}

const RegionShowViewMixin: RegionShowViewMixin = {
  show(this: Region, view, options) {
    if (!this._ensureElement(options)) {
      return;
    }

    view = this._getView(view, options);

    if (view === this.currentView) {
      return this;
    }

    this._isSwappingView = !!this.currentView;

    this.triggerMethod("before:show", this, view, options);

    // Assume an attached view is already in the region for pre-existing DOM
    if (!view._isAttached) {
      this.empty(options);
    }

    this._setupChildView(view);

    this.currentView = view;

    renderView(view);

    this._attachView(view, options);

    this.triggerMethod("show", this, view, options);

    this._isSwappingView = false;

    return this;
  },
  _getView(this: Region, view, options = {}) {
    if (!view) {
      throw new MnError({
        name: "RegionError",
        message:
          "The view passed is undefined and therefore invalid. You must pass a view instance to show."
      });
    }

    if (view._isDestroyed) {
      throw new MnError({
        name: "RegionError",
        message: `View (cid: "${view.cid}") has already been destroyed and cannot be used.`
      });
    }

    if (view instanceof View || CollectionView) {
      return view;
    }

    const viewOptions = this._getViewOptions(view);

    return new View(viewOptions);
  },
  _getViewOptions(this: Region, viewOptions) {
    if (_.isFunction(viewOptions)) {
      return { template: viewOptions };
    }

    if (_.isObject(viewOptions)) {
      return viewOptions;
    }

    const template = function () {
      return viewOptions;
    };

    return { template };
  },
  _setupChildView(this: Region, view) {
    monitorViewEvents(view);

    this._proxyChildViewEvents(view);

    // We need to listen for if a view is destroyed in a way other than through the region.
    // If this happens we need to remove the reference to the currentView since once a view
    // has been destroyed we can not reuse it.
    view.on("destroy", this._empty, this);
  },
  _proxyChildViewEvents(this: Region, view) {
    const parentView = this._parentView;

    if (!parentView) {
      return;
    }

    parentView._proxyChildViewEvents(view);
  },
  _attachView(this: Region, view, options = {}) {
    const shouldTriggerAttach =
      !view._isAttached &&
      this.Dom.hasEl(document.documentElement, this.el) &&
      !this._shouldDisableMonitoring();
    const shouldReplaceEl =
      typeof options.replaceElement === "undefined"
        ? !!_.result(this, "replaceElement")
        : !!options.replaceElement;

    if (shouldTriggerAttach) {
      view.triggerMethod("before:attach", view);
    }

    if (shouldReplaceEl) {
      this._replaceEl(view);
    } else {
      this.attachHtml(view);
    }

    if (shouldTriggerAttach) {
      view._isAttached = true;
      view.triggerMethod("attach", view);
    }
  },
  attachHtml(this: Region, view) {
    this.Dom.appendContents(this.el, view.el, {
      _$el: this.$el,
      _$contents: view.$el
    });
  },
  hasView(this: Region) {
    return !!this.currentView;
  }
};

export { RegionShowViewMixin };
