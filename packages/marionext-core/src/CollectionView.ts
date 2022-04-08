// Collection View
// ---------------

import { _ } from "marionext-lodash";
import { $dom, $Dom } from "marionext-dom";

import { View, ViewOptions } from "./View";
import { Model, Collection } from "marionext-data";

import { monitorViewEvents } from "./Common/Common-monitorViewEvents.function";

import { BaseViewMixin, BaseViewMixinOptions } from "./BaseView/BaseView.mixin";
import { CollectionViewGetChildViewMixin } from "./CollectionView/CollectionView-getChildView.mixin";
import { CollectionViewFilterMixin } from "./CollectionView/CollectionView-filter.mixin";
import { CollectionViewEmptyViewMixin } from "./CollectionView/CollectionView-emptyView.mixin";
import { CollectionViewCollectionEventsMixin } from "./CollectionView/CollectionView-collectionEvents.mixin";
import { CollectionViewSortMixin } from "./CollectionView/CollectionView-sort.mixin";
import { CollectionViewDetachChildViewsMixin } from "./CollectionView/CollectionView-detachChildViews.mixin";
import { CollectionViewRenderChildViewsMixin } from "./CollectionView/CollectionView-renderChildViews.mixin";
import { CollectionViewAddChildViewsMixin } from "./CollectionView/CollectionView-addChildViews.mixin";
import { CollectionViewChildContainerMixin } from "./CollectionView/CollectionView-childContainer.mixin";
import { CollectionViewRemoveChildViewsMixin } from "./CollectionView/CollectionView-removeChildViews.mixin";

// import ElementMixin from "./mixins/element";
// import { tSetDomApi, setDomApi } from "./DomApi";
import { VDom } from "marionext-vdom";
import { tSetRenderer, setRenderer } from "./config/renderer";

interface CollectionViewOptions<
  TModel extends Model,
  TCollection extends Collection<TModel>
> extends ViewOptions<TModel>,
    BaseViewMixinOptions {
  // Specify a child view to use.
  childView?: ((model: TModel) => typeof View) | typeof View;

  // Define options to pass to the childView constructor.
  childViewOptions?:
    | ((...args: any[]) => ViewOptions<TModel>)
    | ViewOptions<TModel>;

  // The events attribute binds DOM events to actions to perform on the
  // view. It takes DOM event key and a mapping to the handler.
  events?: EventMap;

  // Prevent some of the underlying collection's models from being
  // rendered as child views.
  filter?(child?: TModel, index?: number, collection?: TCollection): boolean;

  // Specify a view to use if the collection has no children.
  emptyView?: (() => typeof View) | typeof View;

  // Define options to pass to the emptyView constructor.
  emptyViewOptions?: (() => ViewOptions<TModel>) | ViewOptions<TModel>;

  // If true when you sort your collection there will be no re-rendering,
  // only the DOM nodes will be reordered.
  reorderOnSort?: boolean;

  // If false the collection view will not maintain a sorted collection's
  // order in the DOM.
  sort?: boolean;

  // Render your collection view's children with a different sort order
  // than the underlying Backbone collection.
  viewComparator?:
    | string
    | ((element: TModel) => number | string)
    | ((compare: TModel, to?: TModel) => number); // Mirrors Collection.comparator
}

interface CollectionViewProperties
  extends CollectionViewOptions<Model, Collection<Model>> {
  radioEvents?: StringHash;
  ui?: StringHash;
  radioRequests?: StringHash;
  initialize?: () => void;
}

const classErrorName = "CollectionViewError";

interface CollectionView<
  TModel extends Model,
  TView extends View<TModel>,
  TCollection extends Collection<TModel>
> extends BaseViewMixin,
    BaseViewRegionInterface,
    CollectionViewGetChildViewMixin,
    CollectionViewFilterMixin,
    CollectionViewEmptyViewMixin,
    CollectionViewCollectionEventsMixin,
    CollectionViewSortMixin,
    CollectionViewDetachChildViewsMixin,
    CollectionViewRenderChildViewsMixin,
    CollectionViewAddChildViewsMixin,
    CollectionViewChildContainerMixin,
    CollectionViewRemoveChildViewsMixin {
  extend: any;
  setDomApi: VDom.tSetDomApi;
  setRenderer: tSetRenderer;
  Dom: typeof VDom.DomApi;
  cid: string;
  tagName: string;
  initialize(): void;

  // Specify a child view to use.
  childView?: ((model: TModel) => typeof View) | typeof View;

  // Define options to pass to the childView constructor.
  childViewOptions?:
    | ((...args: any[]) => ViewOptions<TModel>)
    | ViewOptions<TModel>;

  events?: EventMap;
  triggers: EventMap;

  model?: Model;
  collection?: Collection<Model>;

  _addedViews: View<TModel>[];

  // Called in a region's destroy
  _removeReferences(name: string): void;

  $container: $Dom;

  // CollectionView allows for a custom viewComparator option if you want your CollectionView's children to be rendered
  // with a different sort order than the underlying collection uses.
  viewComparator: string | false;

  viewFilter?:
    | string
    | ObjectHash
    | ((view: View<TModel>, index?: number, children?: View<TModel>[]) => any);
}

/**
 * CollectionView
 * --------------
 */
/**
 * The CollectionView will loop through all of the models in the specified
 * collection, render each of them using a specified childView, then append
 * the results of the child view's el to the collection view's el. By
 * default the CollectionView will maintain a sorted collection's order in the
 * DOM. This behavior can be disabled by specifying {sort: false} on
 * initialize.
 */
class CollectionView<
  TModel extends Model,
  TView extends View<TModel>,
  TCollection extends Collection<TModel>
> {
  static classProperties = [
    "model",
    "collection",
    "el",
    "id",
    "attributes",
    "className",
    "tagName",
    "events"
  ];
  static classOptions = [
    "behaviors",
    "childView",
    "childViewContainer",
    "childViewEventPrefix",
    "childViewEvents",
    "childViewOptions",
    "childViewTriggers",
    "collectionEvents",
    "emptyView",
    "emptyViewOptions",
    "events",
    "modelEvents",
    "sortWithCollection",
    "template",
    "templateContext",
    "triggers",
    "ui",
    "viewComparator",
    "viewFilter"
  ];
  static extend = function (
    this: typeof CollectionView,
    protoProps: ObjectHash
  ) {
    const Parent = this;
    let classProperties = {};

    for (let prop in protoProps) {
      if (typeof protoProps[prop] !== "function") {
        classProperties[prop] = protoProps[prop];
      }
    }

    class ExtendedCollectionView extends Parent<
      Model,
      View<Model>,
      Collection<Model>
    > {
      static __super__ = Parent.prototype;
      constructor(options = {}) {
        // for Behavior class, we need the view argument
        Object.assign(classProperties, options);
        super(classProperties);
      }
    }

    // Add static properties to the constructor function, if supplied.
    Object.assign(ExtendedCollectionView, Parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    Object.assign(
      ExtendedCollectionView.prototype,
      Parent.prototype,
      protoProps
    );
    ExtendedCollectionView.prototype.constructor = ExtendedCollectionView;

    // Set a convenience property in case the parent"s prototype is needed
    // later.
    ExtendedCollectionView.__super__ = Parent.prototype;

    return ExtendedCollectionView as any;
  };
  static setDomApi = VDom.setDomApi;
  static setRenderer = setRenderer;

  constructor(options?: CollectionViewOptions<TModel, TCollection>) {
    this._setOptions(options, CollectionView.classOptions);

    monitorViewEvents(this);

    this._initChildViewStorage();
    this._initBehaviors();
    this.cid = _.uniqueId("view");

    Object.assign(this, _.pick(options, CollectionView.classProperties));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    // Init empty region
    this.getEmptyRegion();

    this.delegateEntityEvents();
    this._triggerEventOnBehaviors("initialize", this, options);
  }
}

let CollectionViewProto = CollectionView.prototype;
Object.assign(CollectionView.prototype, BaseViewMixin);

CollectionViewProto._removeReferences = function (
  this: CollectionView<Model, View<Model>, Collection<Model>>,
  name
) {
  delete this.regions[name];
  delete this._regions[name];
};

interface CollectionView<
  TModel extends Model,
  TView extends View<TModel>,
  TCollection extends Collection<TModel>
> {
  // Build a `childView` for a model in the collection.
  // Override to customize the build
  buildChildView(child: Model, ChildViewClass: typeof View, childViewOptions);
}

CollectionViewProto.buildChildView = function (
  this: CollectionView<Model, View<Model>, Collection<Model>>,
  child,
  ChildViewClass,
  childViewOptions
) {
  const options = Object.assign({ model: child }, childViewOptions);
  return new ChildViewClass(options);
};
interface CollectionView<
  TModel extends Model,
  TView extends View<TModel>,
  TCollection extends Collection<TModel>
> {
  _setupChildView(view: View<Model>): void;
}
CollectionViewProto._setupChildView = function (
  this: CollectionView<Model, View<Model>, Collection<Model>>,
  view
) {
  monitorViewEvents(view);

  // We need to listen for if a view is destroyed in a way other
  // than through the CollectionView.
  // If this happens we need to remove the reference to the view
  // since once a view has been destroyed we can not reuse it.
  view.on("destroy", this.removeChildView, this);

  // set up the child view event forwarding
  this._proxyChildViewEvents(view);
};

interface CollectionView<
  TModel extends Model,
  TView extends View<TModel>,
  TCollection extends Collection<TModel>
> {
  // Overriding Backbone.View's `setElement` to handle
  // if an el was previously defined. If so, the view might be
  // attached on setElement.
  setElement(
    element: Element
  ): CollectionView<Model, View<Model>, Collection<Model>>;
}
CollectionViewProto.setElement = function (
  this: CollectionView<Model, View<Model>, Collection<Model>>,
  element
) {
  this.undelegateEvents();
  View.prototype._setElement.apply(this, arguments);
  this.delegateEvents();

  this._isAttached = this.Dom.hasEl(document.documentElement, this.el);

  return this;
};

interface CollectionView<
  TModel extends Model,
  TView extends View<TModel>,
  TCollection extends Collection<TModel>
> {
  // Render children views.
  render(): CollectionView<Model, View<Model>, Collection<Model>>;
}
CollectionViewProto.render = function (
  this: CollectionView<Model, View<Model>, Collection<Model>>
) {
  if (this._isDestroyed) {
    return this;
  }
  this.triggerMethod("before:render", this);

  this._destroyChildren();

  if (this.collection) {
    this._addChildModels(this.collection.models);
    this._initialEvents();
  }

  const template = this.getTemplate();

  if (template) {
    this._renderTemplate(template);
    this.bindUIElements();
  }
  this._getChildViewContainer();
  this.sort();

  this._isRendered = true;

  this.triggerMethod("render", this);
  return this;
};

declare global {
  interface BaseCollectionView
    extends CollectionView<Model, View<Model>, Collection<Model>> {}
}

export { CollectionView, CollectionViewProperties, CollectionViewOptions };
