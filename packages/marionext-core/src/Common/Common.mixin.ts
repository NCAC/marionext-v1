import { EventMixin } from "marionext-event";

import { getOptions as getOption } from "./Common-getOption.function";
import { mergeOptions } from "./Common-mergeOptions.function";
import { _setOptions } from "./Common-setOption.function";
import { normalizeMethods } from "./Common-normalizeMethod.function";
import { triggerMethod } from "./Common-triggerMethod.function";
import { _bindEvents, _unbindEvents } from "./Common-bindEvents.functions";
import {
  _bindRequests,
  _unbindRequests
} from "./Common-bindRequests.functions";

/**
 * -------------
 * CommonMixin
 * used by the following Marionette objects:
 * * View & CollectionView (through BaseViewMixin)
 * * Application
 * * Manager
 * * Behavior
 * * Region
 * * Radio
 * -------------
 * Provides :
 * * normalizeMethod
 * * methods to get/set/merge options
 * * bind/unbind events & requests with Radio
 * * triggerMethod
 */
interface CommonMixin extends EventMixin {
  normalizeMethods: normalizeMethods;
  _setOptions: _setOptions;
  mergeOptions: mergeOptions;
  getOption: getOption;
  bindEvents: typeof _bindEvents;
  unbindEvents: typeof _unbindEvents;
  triggerMethod: triggerMethod;
  bindRequests: _bindRequests;
  unbindRequests: _unbindRequests;
}

const CommonMixin: CommonMixin = Object.assign(EventMixin, {
  // Imports the "normalizeMethods" to transform hashes of
  // events=>function references/names to a hash of events=>function references
  normalizeMethods,

  _setOptions,

  // A handy way to merge passed-in options onto the instance
  mergeOptions,

  // Enable getting options from this or this.options by name.
  getOption,

  // Enable binding view's events from another entity.
  bindEvents: _bindEvents,

  // Enable unbinding view's events from another entity.
  unbindEvents: _unbindEvents,

  // Enable binding view's requests.
  bindRequests: _bindRequests,

  // Enable unbinding view's requests.
  unbindRequests: _unbindRequests,

  triggerMethod
});

export { CommonMixin };
