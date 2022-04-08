import { EventMixinObj } from "../core";
import { EventMixinOnOffApi } from "../core/api";
import { offApi } from "./offApi";
import { EventMixinStopListening } from "./stopListening";

export interface EventMixinOff extends EventMixinStopListening {
  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `name` is null, removes all bound
  // callbacks for all events.
  off(eventName?: string, callback?: EventHandler, context?: any): this;
}

export const EventMixinOff: EventMixinOff = Object.assign(
  EventMixinStopListening,
  {
    off(
      this: EventMixinObj,
      eventName?: string | EventMap,
      callback?: EventHandler,
      context?: any
    ) {
      if (!this._events) {
        return this;
      }
      this._events = EventMixinOnOffApi(
        offApi,
        this._events,
        eventName,
        callback,
        {
          context: context,
          listeners: this._listeners
        }
      );
      return this;
    }
  }
);
