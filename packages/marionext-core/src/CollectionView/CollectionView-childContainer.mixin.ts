import { _ } from "marionext-lodash";
import { Model, Collection } from "marionext-data";
import { View } from "../View";
import { CollectionView } from "../CollectionView";
import { ChildViewContainer } from "../ChildViewContainer";
import { MnError } from "../Utils/error";

/**
 * CollectionViewChildContainerMixin
 * --
 * * setup the `children` and `_children` property
 * * get the children views and `childViewContainer`
 */
interface CollectionViewChildContainerMixin {
  children?: ChildViewContainer;
  _children?: ChildViewContainer;

  // Internal method to set up the `children` object for storing all of the child views
  // `_children` represents all child views
  // `children` represents only views filtered to be shown
  _initChildViewStorage(): void;

  // used by ViewMixin's `_childViewEventHandler`
  _getImmediateChildren(): View<Model>[];

  // Get a container within the template to add the children within
  _getChildViewContainer(): void;
}

const CollectionViewChildContainerMixin: CollectionViewChildContainerMixin = {
  _initChildViewStorage(
    this: CollectionView<Model, View<Model>, Collection<Model>>
  ) {
    this._children = new ChildViewContainer();
    this.children = new ChildViewContainer();
  },

  _getImmediateChildren(
    this: CollectionView<Model, View<Model>, Collection<Model>>
  ) {
    return this.children._views;
  },

  _getChildViewContainer(
    this: CollectionView<Model, View<Model>, Collection<Model>>
  ) {
    const childViewContainer = _.result(this, "childViewContainer") as
      | string
      | Element;
    this.$container = childViewContainer
      ? this.$(childViewContainer)
      : this.$el;

    if (!this.$container.length) {
      throw new MnError({
        name: "CollectionViewError",
        message: `The specified "childViewContainer" was not found: ${childViewContainer}`
      });
    }
  }
};

export { CollectionViewChildContainerMixin };
