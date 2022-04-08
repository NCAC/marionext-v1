import { _ } from "marionext-lodash";
import { EventMixinObj } from "../core";
import { internalOn } from "./internalOn";


export interface EventMixinListenTo {
  // Inversion-of-control versions of `on`. Tell *this* object to listen to
  // an event in another object... keeping track of what it's listening to
  // for easier unbinding later.
  listenTo(object: EventMixinObj, events: string, callback: EventHandler): this;
  listenTo(object: EventMixinObj, eventMap: EventMap): this;
}

export const EventMixinListenTo: EventMixinListenTo = {
  listenTo(
    this: EventMixinObj,
    obj: EventMixinObj,
    events,
    callback?: EventHandler
  ) {
    if (!obj) return this;
    var id = obj._listenId || (obj._listenId = _.uniqueId("l"));
    var listeningTo = this._listeningTo || (this._listeningTo = {});
    var listening = listeningTo[id];

    // This object is not listening to any other events on `obj` yet.
    // Setup the necessary references to track the listening callbacks.
    if (!listening) {
      var thisId = this._listenId || (this._listenId = _.uniqueId("l"));
      listening = listeningTo[id] = {
        obj: obj,
        objId: id,
        id: thisId,
        listeningTo: listeningTo,
        count: 0
      };
    }

    // Bind callbacks on obj, and keep track of them on listening.
    internalOn(obj, events, callback, this, listening);
    return this;
  }
};
