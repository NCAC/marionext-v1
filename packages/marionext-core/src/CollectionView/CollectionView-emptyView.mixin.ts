import { _ } from "marionext-lodash";
import { Region } from "../Region";
import { View, ViewOptions } from "../View";
import { Model, Collection } from "marionext-data";
import { CollectionView } from "../CollectionView";

interface CollectionViewEmptyViewMixin {
  _emptyRegion?: Region;
  getEmptyRegion(): Region;

  // Specify a view to use if the collection has no children.
  emptyView?: (() => typeof View) | typeof View;
  // Define options to pass to the emptyView constructor.
  emptyViewOptions?: (() => ViewOptions<Model>) | ViewOptions<Model>;

  isEmpty(): boolean;
  _showEmptyView(): void;

  // Retrieve the empty view class
  _getEmptyView(): typeof View;

  // Remove the emptyView
  _destroyEmptyView(): void;

  _getEmptyViewOptions(): ObjectHash;
}

const CollectionViewEmptyViewMixin: CollectionViewEmptyViewMixin = {
  getEmptyRegion(this: CollectionView<Model, View<Model>, Collection<Model>>) {
    if (this._emptyRegion && !this._emptyRegion.isDestroyed()) {
      return this._emptyRegion;
    }

    this._emptyRegion = new Region({ el: this.el, replaceElement: false });

    this._emptyRegion._parentView = this;

    return this._emptyRegion;
  },
  isEmpty(this: CollectionView<Model, View<Model>, Collection<Model>>) {
    return !this.children.length;
  },
  _showEmptyView(this: CollectionView<Model, View<Model>, Collection<Model>>) {
    const EmptyView = this._getEmptyView();

    if (!EmptyView) {
      return;
    }

    const options = this._getEmptyViewOptions();

    const emptyRegion = this.getEmptyRegion();

    emptyRegion.show(new EmptyView(options));
  },
  _getEmptyView(this: CollectionView<Model, View<Model>, Collection<Model>>) {
    const emptyView = this.emptyView;

    if (!emptyView) {
      return;
    }

    return this._getView(emptyView);
  },
  _destroyEmptyView(
    this: CollectionView<Model, View<Model>, Collection<Model>>
  ) {
    const emptyRegion = this.getEmptyRegion();
    // Only empty if a view is show so the region
    // doesn't detach any other unrelated HTML
    if (emptyRegion.hasView()) {
      emptyRegion.empty();
    }
  },
  _getEmptyViewOptions(
    this: CollectionView<Model, View<Model>, Collection<Model>>
  ) {
    const emptyViewOptions = this.emptyViewOptions || this.childViewOptions;

    if (_.isFunction(emptyViewOptions)) {
      return emptyViewOptions.call(this);
    }

    return emptyViewOptions;
  }
};

export { CollectionViewEmptyViewMixin };
