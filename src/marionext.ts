import { _ } from "marionext-lodash";
import { $dom, $Dom, $DomStatic } from "marionext-dom";

import { Model, Collection } from "marionext-data";

// import { pugVDOMRuntime, VDom, DomApi } from "marionext-base-view";
import { VDom } from "marionext-vdom";

import {
  View,
  CollectionView,
  Region,
  Manager,
  Behavior,
  Application,
  Radio,
  Router,
  BrowserHistory,
  bindEvents,
  unbindEvents,
  bindRequests,
  unbindRequests,
  mergeOptions,
  getOption,
  normalizeMethods,
  triggerMethod,
  setDomApi,
  setRenderer
} from "marionext-core";

import { EventMixin } from "marionext-event";

export {
  $Dom,
  $dom,
  $DomStatic,
  _,
  EventMixin,
  Model,
  Collection,
  View,
  CollectionView,
  Region,
  Manager,
  Behavior,
  Application,
  Radio,
  Router,
  BrowserHistory,
  bindEvents,
  unbindEvents,
  bindRequests,
  unbindRequests,
  normalizeMethods,
  triggerMethod,
  mergeOptions,
  getOption,
  setDomApi,
  setRenderer,
  VDom
};
