import { EventMixinOnOffApi } from "../core/api";
import { onApi } from "./onApi";
import { EventMixinObj } from "../core/index";
// Guard the `listening` argument from the public API.
export const internalOn = function (
  obj: EventMixinObj,
  name: string | EventMap,
  callback: EventHandler,
  context: any,
  listening?: any
) {
  obj._events = EventMixinOnOffApi(onApi, obj._events || {}, name, callback, {
    context: context,
    ctx: obj,
    listening: listening
  });

  if (listening) {
    var listeners = obj._listeners || (obj._listeners = {});
    listeners[listening.id] = listening;
  }

  return obj;
};
