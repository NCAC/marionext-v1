import { destroyView } from "../BaseView/BaseView-renderDestroy.functions";
import { Region } from "../Region";

interface RegionRemoveViewMixin {
  // Override this method to determine what happens when the view
  // is removed from the region when the view is not being detached
  removeView(view: GenericView): void;
  // Non-Marionette safe view.destroy
  destroyView(view: GenericView): GenericView;

  // If the regions parent view is not monitoring its attach/detach events
  _shouldDisableMonitoring(): boolean;
}

const RegionRemoveViewMixin: RegionRemoveViewMixin = {
  removeView(this: Region, view) {
    this.destroyView(view);
  },
  destroyView(this: Region, view) {
    if (view._isDestroyed) {
      return view;
    }

    destroyView(view, this._shouldDisableMonitoring());
    return view;
  },
  _shouldDisableMonitoring(this: Region) {
    return this._parentView && this._parentView.monitorViewEvents === false;
  }
};

export { RegionRemoveViewMixin };
