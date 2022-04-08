import { Model, Collection } from "marionext-data";
import { View } from "../View";
import { CollectionView } from "../CollectionView";

interface CollectionViewAddChildViewsMixin {
  // Added views are returned for consistency with _removeChildModels
  _addChildModels(models: Model[]): View<Model>[];
  _addChildModel(model: Model): View<Model>;
  _createChildView(model: Model): View<Model>;

  // Render the child's view and add it to the HTML for the collection view at a given index, based on the current sort
  addChildView(view: View<Model>, index?: number);

  _addChild(view: View<Model>, index?: number): void;
}

const CollectionViewAddChildViewsMixin: CollectionViewAddChildViewsMixin = {
  _addChildModels(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    models
  ) {
    return models.map(this._addChildModel.bind(this));
  },
  _addChildModel(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    model
  ) {
    const view = this._createChildView(model);

    this._addChild(view);

    return view;
  },
  _addChild(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    view,
    index
  ) {
    this.triggerMethod("before:add:child", this, view);

    this._setupChildView(view);
    this._children._add(view, index);
    this.children._add(view, index);

    this.triggerMethod("add:child", this, view);
  },
  _createChildView(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    model
  ) {
    const ChildView = this._getChildView(model);
    const childViewOptions = this._getChildViewOptions(model);
    const view = this.buildChildView(model, ChildView, childViewOptions);

    return view;
  },
  addChildView(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    view,
    index
  ) {
    if (!view || view._isDestroyed) {
      return view;
    }

    if (!this._isRendered) {
      this.render();
    }

    const hasIndex = typeof index !== "undefined";

    // Only cache views if added to the end
    if (!hasIndex || index >= this._children.length) {
      this._addedViews = [view];
    }
    this._addChild(view, index);

    if (hasIndex) {
      this._renderChildren();
    } else {
      this.sort();
    }

    return view;
  }
};

export { CollectionViewAddChildViewsMixin };
