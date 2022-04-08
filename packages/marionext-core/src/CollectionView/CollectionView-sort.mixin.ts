import { View } from "../View";
import { Model } from "marionext-data";
import { CollectionView } from "../CollectionView";

interface CollectionViewSortMixin {
  // flag for maintaining the sorted order of the collection
  sortWithCollection: boolean;

  // Sorts the children then filters and renders the results.
  sort(): BaseCollectionView;

  // Sorts views by viewComparator and sets the children to the new order
  _sortChildren(): void;

  // Sets the view's `viewComparator` and applies the sort if the view is ready.
  // To prevent the render pass `{ preventRender: true }` as the 2nd argument.
  setComparator(
    comparator: string | false,
    options?: { preventRender: boolean }
  ): BaseCollectionView;

  // Clears the `viewComparator` and follows the same rules for rendering as `setComparator`.
  removeComparator(options?: { preventRender: boolean }): BaseCollectionView;

  // If viewComparator is overriden it will be returned here.
  // Additionally override this function to provide custom
  // viewComparator logic
  getComparator(): string | false | ((...args: any[]) => number);

  // Default internal view comparator that order the views by
  // the order of the collection
  _viewComparator(view: BaseView): number;
}

const CollectionViewSortMixin: CollectionViewSortMixin = {
  sortWithCollection: true,

  sort(this: BaseCollectionView) {
    this._sortChildren();

    this.filter();

    return this;
  },
  _sortChildren(this: BaseCollectionView) {
    if (!this._children.length) {
      return;
    }

    let viewComparator = this.getComparator();

    if (!viewComparator) {
      return;
    }

    // If children are sorted prevent added to end perf
    delete this._addedViews;

    this.triggerMethod("before:sort", this);

    this._children._sort(viewComparator, this);

    this.triggerMethod("sort", this);
  },

  setComparator(
    this: BaseCollectionView,
    comparator,
    options = { preventRender: false }
  ) {
    const comparatorChanged = this.viewComparator !== comparator;
    const shouldSort = comparatorChanged && !options.preventRender;

    this.viewComparator = comparator;

    if (shouldSort) {
      this.sort();
    }

    return this;
  },
  removeComparator(this: BaseCollectionView, options) {
    return this.setComparator(null, options);
  },
  getComparator(this: BaseCollectionView) {
    if (this.viewComparator) {
      return this.viewComparator;
    }

    if (
      !this.sortWithCollection ||
      this.viewComparator === false ||
      !this.collection
    ) {
      return false;
    }

    return this._viewComparator;
  },
  _viewComparator(this: BaseCollectionView, view) {
    return this.collection.indexOf(view.model);
  }
};

export { CollectionViewSortMixin };
