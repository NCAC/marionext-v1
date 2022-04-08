import { _ } from "marionext-lodash";
import { EventMixinObj } from "../core";
import { EventMixinListenTo } from "./listenTo";
import { internalOn } from "./internalOn";

export interface EventMixinOn extends EventMixinListenTo {
  // Bind an event to a `callback` function. Passing `"all"` will bind
  // the callback to all events fired.
  on(eventName: string, callback: EventHandler, context?: any): this;
  on(eventMap: EventMap): this;
}

export const EventMixinOn: EventMixinOn = Object.assign(EventMixinListenTo, {
  on(
    this: EventMixinObj,
    events: string | EventMap,
    callback?: EventHandler,
    context?: any
  ): any {
    return internalOn(this, events, callback, context);
  }
});
