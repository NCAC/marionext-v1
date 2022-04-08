import { View } from "../View";
import { Model, Collection } from "marionext-data";
import { CollectionView } from "../CollectionView";

interface CollectionViewDetachChildViewsMixin {
  _detachChildren(detachingViews: View<Model>[]): void;
  _detachChildView(view: View<Model>): void;

  // Override this method to change how the collectionView detaches a child view
  detachHtml(view: View<Model>): void;
}

const CollectionViewDetachChildViewsMixin: CollectionViewDetachChildViewsMixin = {
  _detachChildren(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    detachingViews
  ) {
    detachingViews.forEach(view => {
      this._detachChildView.bind(this, view);
    });
  },
  _detachChildView(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    view
  ) {
    const shouldTriggerDetach =
      view._isAttached && this.monitorViewEvents !== false;
    if (shouldTriggerDetach) {
      view.triggerMethod("before:detach", view);
    }

    this.detachHtml(view);

    if (shouldTriggerDetach) {
      view._isAttached = false;
      view.triggerMethod("detach", view);
    }
  },
  detachHtml(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    view
  ) {
    this.Dom.detachEl(view.el, view.$el);
  }
};

export { CollectionViewDetachChildViewsMixin };
