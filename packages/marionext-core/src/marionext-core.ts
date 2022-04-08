import { _ } from "marionext-lodash";
// import "./Utils/error";
const proxy = function (method: Function) {
  return function (context, ...args) {
    return method.apply(context, args);
  };
};

import {
  Model,
  Collection,
  CollectionPredicate,
  ModelSetOptions,
  AddOptions
} from "marionext-data";

import {
  _bindEvents,
  _unbindEvents
} from "./Common/Common-bindEvents.functions";

import {
  _bindRequests,
  _unbindRequests
} from "./Common/Common-bindRequests.functions";

import { getOptions as _getOptions } from "./Common/Common-getOption.function";
import { mergeOptions as _mergeOptions } from "./Common/Common-mergeOptions.function";
import { monitorViewEvents } from "./Common/Common-monitorViewEvents.function";
import { normalizeMethods as _normalizeMethods } from "./Common/Common-normalizeMethod.function";
import { triggerMethod as _triggerMethod } from "./Common/Common-triggerMethod.function";

import { BrowserHistoryInstance } from "./BrowserHistory";
import { Router } from "./Router";
import { Radio, Channel } from "./Radio";
import { Manager } from "./Manager";

import { View, ViewProperties, ViewOptions } from "./View";
// Mixins for View class
import { ViewElementMixin } from "./View/View-element.mixin";
import { BaseViewMixin } from "./BaseView/BaseView.mixin";
import { ViewRenderMixin } from "./View/View-render.mixin";
import { ViewRegionMixin } from "./View/View-region.mixin";

import { Region } from "./Region";
// Mixins for Region Class
import { RegionElementMixin } from "./Region/Region-element.mixin";
import { RegionRemoveViewMixin } from "./Region/Region-removeView.mixin";
import { RegionDestroyMixin } from "./Region/Region-destroy.mixin";
import { RegionDetachViewMixin } from "./Region/Region-detachView.mixin";
import { RegionShowViewMixin } from "./Region/Region-showView.mixin";

import {
  CollectionView,
  CollectionViewOptions,
  CollectionViewProperties
} from "./CollectionView";
// Mixins for CollectionViewClass
import { CollectionViewGetChildViewMixin } from "./CollectionView/CollectionView-getChildView.mixin";
import { CollectionViewAddChildViewsMixin } from "./CollectionView/CollectionView-addChildViews.mixin";
import { CollectionViewChildContainerMixin } from "./CollectionView/CollectionView-childContainer.mixin";
import { CollectionViewCollectionEventsMixin } from "./CollectionView/CollectionView-collectionEvents.mixin";
import { CollectionViewDetachChildViewsMixin } from "./CollectionView/CollectionView-detachChildViews.mixin";
import { CollectionViewEmptyViewMixin } from "./CollectionView/CollectionView-emptyView.mixin";
import { CollectionViewFilterMixin } from "./CollectionView/CollectionView-filter.mixin";
import { CollectionViewRemoveChildViewsMixin } from "./CollectionView/CollectionView-removeChildViews.mixin";
import { CollectionViewRenderChildViewsMixin } from "./CollectionView/CollectionView-renderChildViews.mixin";
import { CollectionViewSortMixin } from "./CollectionView/CollectionView-sort.mixin";

import { Behavior } from "./Behavior";
import { Application } from "./Application";

// import { DomApi } from "./DomApi";
import { Silenceable } from "marionext-data";

import { isEnabled, setEnabled } from "./config/features";

declare global {
  type GenericView =
    | View<Model>
    | CollectionView<Model, View<Model>, Collection<Model>>;

  interface BaseView extends View<Model> {}
  interface BaseCollectionView
    extends CollectionView<Model, View<Model>, Collection<Model>> {}
}

// Object.assign(View.prototype, ViewElementMixin, BaseViewMixin);
Object.assign(Region.prototype, RegionElementMixin);

// Object.assign(View.prototype, ViewRenderMixin);
Object.assign(
  Region.prototype,
  RegionRemoveViewMixin,
  RegionDestroyMixin,
  RegionDetachViewMixin
);

Object.assign(View.prototype, ViewRegionMixin);
Object.assign(Region.prototype, RegionShowViewMixin);

Object.assign(
  CollectionView.prototype,
  CollectionViewCollectionEventsMixin,
  CollectionViewChildContainerMixin,
  CollectionViewEmptyViewMixin,
  CollectionViewAddChildViewsMixin,
  CollectionViewRenderChildViewsMixin,
  CollectionViewDetachChildViewsMixin,
  CollectionViewRemoveChildViewsMixin,
  CollectionViewSortMixin,
  CollectionViewFilterMixin,
  CollectionViewGetChildViewMixin
);

// Utilities
export const bindEvents = proxy(_bindEvents);
export const unbindEvents = proxy(_unbindEvents);
export const bindRequests = proxy(_bindRequests);
export const unbindRequests = proxy(_unbindRequests);
export const mergeOptions = proxy(_mergeOptions);
export const getOption = proxy(_getOptions);
export const normalizeMethods = proxy(_normalizeMethods);
export const triggerMethod = proxy(_triggerMethod);

// Configuration
export const setDomApi = function (mixin) {
  CollectionView.setDomApi(mixin);
  Region.setDomApi(mixin);
  View.setDomApi(mixin);
};
export const setRenderer = function (renderer) {
  CollectionView.setRenderer(renderer);
  View.setRenderer(renderer);
};

export {
  Region,
  View,
  ViewOptions,
  ViewProperties,
  CollectionView,
  CollectionViewOptions,
  CollectionViewProperties,
  Manager,
  Behavior,
  Application,
  Radio,
  Channel,
  Router,
  BrowserHistoryInstance as BrowserHistory,
  isEnabled,
  setEnabled,
  monitorViewEvents
};
