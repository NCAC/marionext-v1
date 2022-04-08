import { Model, Collection } from "marionext-data";
import { View } from "../View";
import { CollectionView } from "../CollectionView";
import { MnError } from "../Utils/error";
import { destroyView } from "../BaseView/BaseView-renderDestroy.functions";
interface CollectionViewRemoveChildViewsMixin {
  swapChildViews(view1: View<Model>, view2: View<Model>): void;

  // Detach a view from the children.  Best used when adding a
  // childView from `addChildView`
  detachChildView(view: View<Model>): View<Model>;

  // Remove the child view and destroy it.  Best used when adding a
  // childView from `addChildView`
  // The options argument is for internal use only
  removeChildView(
    view: View<Model>,
    options?: { shouldDetach: boolean }
  ): View<Model>;

  _removeChildViews(views: View<Model>[]): void;
  _removeChildView(
    view: View<Model>,
    options?: { shouldDetach: boolean }
  ): void;
  _destroyChildView(view: View<Model>): void;

  // called by ViewMixin destroy
  _removeChildren(): void;

  // Destroy the child views that this collection view is holding on to, if any
  _destroyChildren(): void;

  _removeChildModels(models: Model[]): View<Model>[];
  _removeChildModel(model: Model): View<Model>;
  _removeChild(View: View<Model>): void;
}

const CollectionViewRemoveChildViewsMixin: CollectionViewRemoveChildViewsMixin = {
  swapChildViews(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    view1,
    view2
  ) {
    if (!this._children.hasView(view1) || !this._children.hasView(view2)) {
      throw new MnError({
        name: "CollectionViewError",
        message: "Both views must be children of the collection view to swap.",
        url: "marionette.collectionview.html#swapping-child-views"
      });
    }

    this._children._swap(view1, view2);
    this.Dom.swapEl(view1.el, view2.el);

    // If the views are not filtered the same, refilter
    if (this.children.hasView(view1) !== this.children.hasView(view2)) {
      this.filter();
    } else {
      this.children._swap(view1, view2);
    }

    return this;
  },

  _removeChildModels(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    models
  ) {
    return models.reduce((views, model) => {
      const removeView = this._removeChildModel(model);

      if (removeView) {
        views.push(removeView);
      }

      return views;
    }, []);
  },

  _removeChild(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    view
  ) {
    this.triggerMethod("before:remove:child", this, view);

    this.children._remove(view);
    this._children._remove(view);

    this.triggerMethod("remove:child", this, view);
  },
  detachChildView(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    view
  ) {
    this.removeChildView(view, { shouldDetach: true });

    return view;
  },
  removeChildView(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    view,
    options
  ) {
    if (!view) {
      return view;
    }

    this._removeChildView(view, options);

    this._removeChild(view);

    if (this.isEmpty()) {
      this._showEmptyView();
    }

    return view;
  },
  _removeChildViews(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    views
  ) {
    views.forEach(view => {
      this._removeChildView.bind(this, view);
    });
  },
  _removeChildView(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    view,
    options = { shouldDetach: false }
  ) {
    view.off("destroy", this.removeChildView, this);

    if (options.shouldDetach) {
      this._detachChildView(view);
    } else {
      this._destroyChildView(view);
    }

    this.stopListening(view);
  },
  _removeChildModel(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    model
  ) {
    const view = this._children.findByModel(model);

    if (view) {
      this._removeChild(view);
    }

    return view;
  },
  _destroyChildView(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    view
  ) {
    if (view._isDestroyed) {
      return;
    }

    const shouldDisableEvents = this.monitorViewEvents === false;
    destroyView(view, shouldDisableEvents);
  },
  _removeChildren(this: CollectionView<Model, View<Model>, Collection<Model>>) {
    this._destroyChildren();
    const emptyRegion = this.getEmptyRegion();
    emptyRegion.destroy();
    delete this._addedViews;
  },
  _destroyChildren(
    this: CollectionView<Model, View<Model>, Collection<Model>>
  ) {
    if (!this._children.length) {
      return;
    }

    this.triggerMethod("before:destroy:children", this);
    if (this.monitorViewEvents === false) {
      this.Dom.detachContents(this.el, this.$el);
    }

    this._removeChildViews(this._children._views);

    // After all children have been destroyed re-init the container
    this._children._init();
    this.children._init();

    this.triggerMethod("destroy:children", this);
  }
};

export { CollectionViewRemoveChildViewsMixin };
