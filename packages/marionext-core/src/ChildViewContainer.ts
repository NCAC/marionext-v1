import { _ } from "marionext-lodash";

import { View } from "./View";
import { Model, CollectionPredicate } from "marionext-data";


const makeContainerIterator = (function () {
  const viewMatcher = function viewMatcher(attrs) {
    var matcher = _.matches(attrs);
    return function (view) {
      return matcher(view);
    };
  };
  return function makeContainerIterator(
    iteratee
  )/*: ListIterator<View<Model>, boolean>*/ {
    if (_.isFunction(iteratee)) {
      return iteratee;
    }
    if (_.isObject(iteratee)) {
      return viewMatcher(iteratee);
    }
    if (_.isString(iteratee)) {
      return function (view) {
        return view[iteratee];
      };
    }
    return iteratee;
  };
})();

// Provide a container to store, retrieve and
// shut down child views.
interface ChildViewContainer {
  length: number;
  // Initializes an empty container
  _init(): void;
  _views: View<Model>[];
  _viewsByCid: { [key: string]: View<Model> };
  _indexByModel: object;
  _updateLength(): void;
}
class ChildViewContainer {
  constructor() {
    this._init();
  }
}

let ChildViewContainerProto = ChildViewContainer.prototype;

ChildViewContainerProto._init = function (this: ChildViewContainer) {
  this._views = [];
  this._viewsByCid = {};
  this._indexByModel = {};
  this._updateLength();
};

interface ChildViewContainer {
  // Add a view to this container. Stores the view
  // by `cid` and makes it searchable by the model
  // cid (and model itself). Additionally it stores
  // the view by index in the _views array
  _add(view: View<Model>, index?: number): void;
}
ChildViewContainerProto._add = function (
  this: ChildViewContainer,
  view,
  index = this._views.length
) {
  this._addViewIndexes(view);

  // add to end by default
  this._views.splice(index, 0, view);
  this._updateLength();
};

interface ChildViewContainer {
  _addViewIndexes(view: View<Model>): void;
}
ChildViewContainerProto._addViewIndexes = function (
  this: ChildViewContainer,
  view
) {
  // store the view
  this._viewsByCid[view.cid] = view;

  // index it by model
  if (view.model) {
    this._indexByModel[view.model.cid] = view;
  }
};

interface ChildViewContainer {
  // Sort (mutate) and return the array of the child views.
  _sort(comparator: string | Function, context): View<Model>[];

  // Makes `_.sortBy` mutate the array to match `this._views.sort`
  _sortBy(comparator): View<Model>[];
}
ChildViewContainerProto._sort = function (
  this: ChildViewContainer,
  comparator,
  context
) {
  const stringComparator = function (comparator: string, view) {
    return view.model && view.model.get(comparator);
  };
  if (_.isString(comparator)) {
    return this._sortBy(view => stringComparator(comparator, view));
  }

  if (comparator.length === 1) {
    return this._sortBy(comparator.bind(context));
  }

  return this._views.sort(comparator.bind(context));
};
ChildViewContainerProto._sortBy = function (
  this: ChildViewContainer,
  comparator
) {
  const sortedViews = _.sortBy(this._views, comparator);

  this._set(sortedViews);

  return sortedViews;
};

interface ChildViewContainer {
  // Replace array contents without overwriting the reference.
  // Should not add/remove views
  _set(views: View<Model>[], shouldReset?: boolean): void;
}
ChildViewContainerProto._set = function (
  this: ChildViewContainer,
  views,
  shouldReset
) {
  this._views.length = 0;
  this._views.push.apply(this._views, views.slice(0));

  if (shouldReset) {
    this._viewsByCid = {};
    this._indexByModel = {};

    views.forEach(() => this._addViewIndexes.bind(this));

    this._updateLength();
  }
};

interface ChildViewContainer {
  // Swap views by index
  _swap(view1: View<Model>, view2: View<Model>): void;
}
ChildViewContainerProto._swap = function (
  this: ChildViewContainer,
  view1,
  view2
) {
  const view1Index = this.findIndexByView(view1);
  const view2Index = this.findIndexByView(view2);

  if (view1Index === -1 || view2Index === -1) {
    return;
  }

  const swapView = this._views[view1Index];
  this._views[view1Index] = this._views[view2Index];
  this._views[view2Index] = swapView;
};

interface ChildViewContainer {
  // Find a view by the model that was attached to it.
  // Uses the model's `cid` to find it.
  findByModel(model: Model): View<Model>;

  // Find a view by the `cid` of the model that was attached to it.
  findByModelCid(modelCid: string): View<Model>;

  // Find a view by index.
  findByIndex(index: number): View<Model>;

  // Find the index of a view instance
  findIndexByView(view: View<Model>): number;

  // Retrieve a view by its `cid` directly
  findByCid(cid: string): View<Model>;
}
ChildViewContainerProto.findByModel = function (
  this: ChildViewContainer,
  model
) {
  return this.findByModelCid(model.cid);
};
ChildViewContainerProto.findByModelCid = function (
  this: ChildViewContainer,
  modelCid
) {
  return this._indexByModel[modelCid];
};
ChildViewContainerProto.findByIndex = function (
  this: ChildViewContainer,
  index
) {
  return this._views[index];
};
ChildViewContainerProto.findIndexByView = function (
  this: ChildViewContainer,
  view
) {
  return this._views.indexOf(view);
};
ChildViewContainerProto.findByCid = function (this: ChildViewContainer, cid) {
  return this._viewsByCid[cid];
};

interface ChildViewContainer {
  hasView(view: View<Model>): boolean;
}
ChildViewContainerProto.hasView = function (this: ChildViewContainer, view) {
  return !!this.findByCid(view.cid);
};

interface ChildViewContainer {
  // Remove a view and clean up index references.
  _remove(view: View<Model>): void;
}
ChildViewContainerProto._remove = function (this: ChildViewContainer, view) {
  if (!this._viewsByCid[view.cid]) {
    return;
  }

  // delete model index
  if (view.model) {
    delete this._indexByModel[view.model.cid];
  }

  // remove the view from the container
  delete this._viewsByCid[view.cid];

  const index = this.findIndexByView(view);
  this._views.splice(index, 1);

  this._updateLength();
};

interface ChildViewContainer {
  _updateLength(): void;
}
ChildViewContainerProto._updateLength = function (this: ChildViewContainer) {
  this.length = this._views.length;
};

interface ChildViewContainer {
  forEach(iterator: ListIterator<View<Model>, void>, context?: any): void;
  map<TResult>(
    iterator: ListIterator<View<Model>, TResult>,
    context?: any
  ): TResult[];
  find(predicate: CollectionPredicate): View<Model>;
  filter(predicate: CollectionPredicate): View<Model>[];
  // test if all views pass the test implemented by the provided predicate.
  every(predicate: CollectionPredicate): boolean;
  some(predicate: CollectionPredicate, context?: any): boolean;
  contains(view: View<Model>): boolean;
  isEmpty(): boolean;
  pluck(attribute: string): View<Model>[];
}
ChildViewContainerProto.forEach = function (this: ChildViewContainer, iterator) {
  this._views.forEach(iterator);
};
ChildViewContainerProto.map = function (this: ChildViewContainer, iterator) {
  return this._views.map(iterator);
};
ChildViewContainerProto.find = function (this: ChildViewContainer, predicate) {
  return this._views.find(makeContainerIterator(predicate));
};
ChildViewContainerProto.filter = function (this: ChildViewContainer, predicate) {
  return this._views.filter(makeContainerIterator(predicate));
};
ChildViewContainerProto.every = function (this: ChildViewContainer, predicate) {
  return this._views.every(makeContainerIterator(predicate));
};
ChildViewContainerProto.some = function (this: ChildViewContainer, predicate) {
  return this._views.some(makeContainerIterator(predicate));
};
ChildViewContainerProto.contains = function (this: ChildViewContainer, view) {
  return this._views.includes(view);
};
ChildViewContainerProto.isEmpty = function (this: ChildViewContainer) {
  return this._views.length > 0;
};
ChildViewContainerProto.pluck = function (this: ChildViewContainer, attr) {
  return this._views.map(function (view) {
    return view[attr];
  });
};

export { ChildViewContainer };
