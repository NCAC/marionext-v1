import { _ } from "marionext-lodash";
import {
  EventMixin,
  EventMixinObj
} from "../core/index";

export interface EventMixinStopListening {
  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  stopListening(
    obj?: EventMixinObj,
    eventName?: string | EventMap,
    callback?: EventHandler
  ): EventMixin;
}

export const EventMixinStopListening: EventMixinStopListening = {
  stopListening(this: EventMixin, obj: EventMixinObj, eventName, callback) {
    const listeningTo = this._listeningTo;
    if (!listeningTo) {
      return this;
    }

    var ids = obj ? [obj._listenId] : _.keys(listeningTo);

    for (var i = 0; i < ids.length; i++) {
      var listening = listeningTo[ids[i]];

      // If listening doesn't exist, this object is not currently
      // listening to obj. Break out early.
      if (!listening) break;

      listening.obj.off(eventName, callback, this);
    }

    return this;
  }
};
