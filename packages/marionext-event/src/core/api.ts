import { _ } from "marionext-lodash";
import {
  EventMixin,
  _listenings
} from "./index";
import { onApi } from "../on/onApi";
import { offApi } from "../off/offApi";
import { onceMap } from "../once/onceMap";
import { eventTriggerApi } from "../trigger/api";

// type MnEventIteratee = onApi | offApi | onceMap;

// Regular expression used to split event strings.
const eventSplitter = /\s+/;

export type EventMixinOnOffApi = (
  iteratee: onApi | offApi,
  events: _events,
  name?: string | EventMap,
  callback?: EventHandler,
  opts?: EventMixinApiOptions
) => _events;

export type EventMixinTriggerApi = (
  iteratee: eventTriggerApi,
  events: _events,
  name: string | EventMap,
  ...args: any[]
) => _events;

export type EventMixinOnceApi = (
  iteratee: onceMap,
  events: EventMap,
  name: string | EventMap,
  callback: EventHandler,
  opts?: EventMixinApiOptions
) => EventMap;

export interface EventMixinApiOptions {
  context?: any;
  ctx?: EventMixin;
  listening?: any;
  listeners?: _listenings;
}

export const EventMixinOnOffApi: EventMixinOnOffApi = (
  iteratee,
  events,
  name,
  callback,
  opts
) => {
  if (name && _.isPlainObject(name)) {
    // Handle event maps.
    if (
      !_.isUndefined(callback) &&
      "context" in opts &&
      _.isUndefined(opts.context)
    ) {
      opts.context = callback;
    }
    const names = _.keys(name as EventMap);
    for (let i = 0; i < names.length; i += 1) {
      events = EventMixinOnOffApi(
        iteratee,
        events,
        names[i],
        name[names[i]],
        opts
      );
    }
  } else if (name && eventSplitter.test(name as string)) {
    // Handle space-separated event names by delegating them individually.
    const names = name.split(eventSplitter);
    for (let j = 0; j < (names as string[]).length; j += 1) {
      events = iteratee(events, names[j], callback, opts);
    }
  } else {
    // Finally, standard events.
    events = iteratee(events, name as string, callback, opts);
  }
  return events;
};

export const EventMixinTriggerApi: EventMixinTriggerApi = (
  iteratee,
  events,
  name,
  ...args
) => {
  if (name && eventSplitter.test(name as string)) {
    // Handle space-separated event names by delegating them individually.
    const names = name.split(eventSplitter);
    for (let j = 0; j < (names as string[]).length; j += 1) {
      events = iteratee(events, names[j], args);
    }
  } else {
    // Finally, standard events.
    events = iteratee(events, name as string, args);
  }
  return events;
};

export const EventMixinOnceApi: EventMixinOnceApi = function (
  iteratee: onceMap,
  events: EventMap,
  name: string | EventMap,
  callback,
  opts
) {
  let i = 0,
    names;

  if (name && typeof name === "object") {
    // Handle event maps.
    if (callback !== void 0 && "context" in opts && opts.context === void 0) {
      opts.context = callback;
    }
    const names = _.keys(name);
    for (let i = 0; i < names.length; i++) {
      events = EventMixinOnceApi(
        iteratee,
        events,
        names[i],
        name[names[i]],
        opts
      );
    }
  } else if (name && eventSplitter.test(name as string)) {
    // Handle space-separated event names by delegating them individually.
    for (names = name.split(eventSplitter); i < names.length; i++) {
      events = iteratee(events, names[i], callback, opts);
    }
  } else {
    // Finally, standard events.
    events = iteratee(events, name as string, callback, opts);
  }
  return events;
};
