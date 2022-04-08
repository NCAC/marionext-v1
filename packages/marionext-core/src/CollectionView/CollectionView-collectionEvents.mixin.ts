import { View } from "../View";
import { CollectionView } from "../CollectionView";
import { Model, Collection } from "marionext-data";

interface CollectionViewCollectionEventsMixin {
  // Configured the initial events that the collection view binds to.
  _initialEvents(): void;

  // Internal method. This checks for any changes in the order of the collection.
  // If the index of any view doesn't match, it will re-sort.
  _onCollectionSort(
    collection: Collection<Model>,
    args?: { add?: any; merge?: any; remove?: any }
  ): void;
  _onCollectionReset(): void;

  // Handle collection update model additions and removals
  _onCollectionUpdate(collection: Collection<Model>, options: any): void;
}

const CollectionViewCollectionEventsMixin: CollectionViewCollectionEventsMixin = {
  // Configured the initial events that the collection view binds to.
  _initialEvents(this: CollectionView<Model, View<Model>, Collection<Model>>) {
    if (this._isRendered) {
      return;
    }

    this.listenTo(this.collection, {
      sort: this._onCollectionSort,
      reset: this._onCollectionReset,
      update: this._onCollectionUpdate
    });
  },

  // Internal method. This checks for any changes in the order of the collection.
  // If the index of any view doesn't match, it will re-sort.
  _onCollectionSort(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    collection,
    args
  ) {
    if (!this.sortWithCollection || this.viewComparator === false) {
      return;
    }
    const add = args.add,
      merge = args.merge,
      remove = args.remove;
    // If the data is changing we will handle the sort later in `_onCollectionUpdate`
    if (add || remove || merge) {
      return;
    }

    // If the only thing happening here is sorting, sort.
    this.sort();
  },
  _onCollectionReset(
    this: CollectionView<Model, View<Model>, Collection<Model>>
  ) {
    this._destroyChildren();

    this._addChildModels(this.collection.models);

    this.sort();
  },

  // Handle collection update model additions and removals
  _onCollectionUpdate(
    this: CollectionView<Model, View<Model>, Collection<Model>>,
    collection,
    options
  ) {
    const changes = options.changes;

    // Remove first since it'll be a shorter array lookup.
    const removedViews =
      changes.removed.length && this._removeChildModels(changes.removed);

    this._addedViews =
      changes.added.length && this._addChildModels(changes.added);

    this._detachChildren(removedViews);

    this.sort();

    // Destroy removed child views after all of the render is complete
    this._removeChildViews(removedViews);
  }
};

export { CollectionViewCollectionEventsMixin };
