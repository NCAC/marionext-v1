import { EventMixinObj } from "../core";
import { eventTriggerApi } from "./api";
import { EventMixinTriggerApi } from "../core/api";
export interface EventMixinTrigger {
  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  trigger(eventName: string, ...args: any[]): any;
}

export const EventMixinTrigger: EventMixinTrigger = {
  trigger(this: EventMixinObj, eventName, ...args: any[]) {
    if (!this._events) {
      return this;
    }
    EventMixinTriggerApi(eventTriggerApi, this._events, eventName, ...args);
    return this;
  }
};
