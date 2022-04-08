import { _ } from "marionext-lodash";

import { Model, Collection } from "marionext-data";
import { View } from "../View";
import { MnError } from "../Utils/error";

interface CollectionViewFilterMixin {
  // This method filters the children views and renders the results
  filter(): BaseCollectionView;

  _filterChildren(): void;

  // This method returns a function for the viewFilter
  _getFilter(): ((...args: []) => any) | false;

  // Override this function to provide custom
  // viewFilter logic
  getFilter():
    | string
    | ObjectHash
    | ((view: View<Model>, index?: number, children?: View<Model>[]) => any)
    | any;

  // Sets the view's `viewFilter` and applies the filter if the view is ready.
  // To prevent the render pass `{ preventRender: true }` as the 2nd argument.
  setFilter(
    filter:
      | string
      | ObjectHash
      | ((view: View<Model>, index?: number, children?: View<Model>[]) => any),
    options?: { preventRender: boolean }
  ): BaseCollectionView;

  // Clears the `viewFilter` and follows the same rules for rendering as `setFilter`.
  removeFilter(options?: { preventRender: boolean }): void;
}
const CollectionViewFilterMixin: CollectionViewFilterMixin = {
  filter(this: BaseCollectionView) {
    if (this._isDestroyed) {
      return this;
    }

    this._filterChildren();

    this._renderChildren();

    return this;
  },
  _filterChildren(this: BaseCollectionView) {
    if (!this._children.length) {
      return;
    }

    const viewFilter = this._getFilter();

    if (!viewFilter) {
      const shouldReset = this.children.length !== this._children.length;

      this.children._set(this._children._views, shouldReset);

      return;
    }

    // If children are filtered prevent added to end perf
    delete this._addedViews;

    this.triggerMethod("before:filter", this);

    const attachViews = [];
    const detachViews = [];

    this._children._views.forEach((view, key, children) => {
      (viewFilter.call(this, view, key, children)
        ? attachViews
        : detachViews
      ).push(view);
    });

    this._detachChildren(detachViews);

    // reset children
    this.children._set(attachViews, true);

    this.triggerMethod("filter", this, attachViews, detachViews);
  },
  _getFilter(this: BaseCollectionView) {
    const viewFilter = this.getFilter();

    if (!viewFilter) {
      return false;
    }

    if (_.isFunction(viewFilter)) {
      return viewFilter;
    }

    // Support filter predicates `{ fooFlag: true }`
    if (_.isObject(viewFilter)) {
      const matcher = _.matches(viewFilter);
      return function (view) {
        return matcher(view.model && view.model.attributes);
      };
    }

    // Filter by model attribute
    if (_.isString(viewFilter)) {
      return function (view: View<Model>) {
        return view.model && view.model.get(viewFilter);
      };
    }

    throw new MnError({
      name: "CollectionViewError",
      message:
        "'viewFilter' must be a function, predicate object literal, a string indicating a model attribute, or falsy"
    });
  },
  getFilter(this: BaseCollectionView) {
    return this.viewFilter;
  },
  setFilter(
    this: BaseCollectionView,
    filter,
    options = { preventRender: false }
  ) {
    const filterChanged = this.viewFilter !== filter;
    const shouldRender = filterChanged && !options.preventRender;

    this.viewFilter = filter;

    if (shouldRender) {
      this.filter();
    }

    return this;
  },
  removeFilter(this: BaseCollectionView, options) {
    return this.setFilter(null, options);
  }
};

export { CollectionViewFilterMixin };
