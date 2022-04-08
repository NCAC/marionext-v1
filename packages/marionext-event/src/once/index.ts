import { EventMixin, EventMixinObj } from "../core";
import { EventMixinOnceApi } from "../core/api";
import { onceMap } from "./onceMap";

export interface EventMixinOnce {
  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, its listener will be removed. If multiple events
  // are passed in using the space-separated syntax, the handler will fire
  // once for each event, not once for a combination of all events.
  once(eventsName: string, callback: EventHandler, context): EventMixin;

  // Inversion-of-control versions of `once`.
  listenToOnce(
    obj: EventMixinObj,
    events: string,
    callback: EventHandler
  ): EventMixin;
}

export const EventMixinOnce: EventMixinOnce = {
  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, its listener will be removed. If multiple events
  // are passed in using the space-separated syntax, the handler will fire
  // once for each event, not once for a combination of all events.
  once(this: EventMixin, eventsName: string, callback: EventHandler, context) {
    const eventsMap = EventMixinOnceApi(
      onceMap,
      {},
      eventsName,
      callback,
      this.off.bind(this)
    );
    // if (typeof eventsName === "string" && context == null) {
    //   callback = void 0;
    // }
    return this.on(eventsMap);
  },

  // Inversion-of-control versions of `once`.
  listenToOnce(this: EventMixin, obj, eventName, callback) {
    // Map the event into a `{event: once}` object.
    // var events = eventsApi(onceMap, {}, eventName, callback, _.bind(this.stopListening, this, obj));
    var events = EventMixinOnceApi(
      onceMap,
      {},
      eventName,
      callback,
      this.stopListening.bind(this, obj)
    );
    return this.listenTo(obj, events);
  }
};
