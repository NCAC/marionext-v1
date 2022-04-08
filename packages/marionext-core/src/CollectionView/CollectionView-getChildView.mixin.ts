import { MnError } from "../Utils/error";
import { Model, Collection } from "marionext-data";
import { View } from "../View";
import { CollectionView } from "../CollectionView";
import { _ } from "marionext-lodash";

interface CollectionViewGetChildViewMixin {
  // Retrieve the `childView` class
  // The `childView` property can be either a view class or a function that
  // returns a view class. If it is a function, it will receive the model that
  // will be passed to the view instance (created from the returned view class)
  _getChildView(child: Model): typeof View; // | ((model: Model) => typeof View);

  // First check if the `view` is a view class (the common case)
  // Then check if it's a function (which we assume that returns a view class)
  _getView(
    view: typeof View | ((model: Model) => typeof View),
    child?: Model
  ): typeof View;
  _getChildViewOptions(child: Model): ObjectHash;
}

const CollectionViewGetChildViewMixin: CollectionViewGetChildViewMixin = {
  _getChildView(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    child
  ) {
    let childView = this.childView;

    if (!childView) {
      throw new MnError({
        name: "CollectionViewError",
        message: "A 'childView' must be specified"
      });
    }

    childView = this._getView(childView, child);

    if (!childView) {
      throw new MnError({
        name: "CollectionViewError",
        message:
          "'childView' must be a view class or a function that returns a view class",
        url: "marionette.collectionview.html#collectionviews-childview"
      });
    }

    return childView;
  },
  _getView(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    view,
    child
  ) {
    if (view.prototype instanceof View || view === View) {
      return view;
    } else if (_.isFunction(view)) {
      return view.call(this, child);
    }
  },
  _getChildViewOptions(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    child: Model
  ) {
    if (_.isFunction(this.childViewOptions)) {
      return this.childViewOptions(child);
    }

    return this.childViewOptions;
  }
};

export { CollectionViewGetChildViewMixin };
