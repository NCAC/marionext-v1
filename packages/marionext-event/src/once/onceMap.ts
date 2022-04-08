import { _ } from "marionext-lodash";

export type onceMap = (map, name, callback: EventHandler, offer) => EventMap;
// Reduces the event callbacks into a map of `{event: onceWrapper}`.
// `offer` unbinds the `onceWrapper` after it has been called.
export const onceMap = function (map, name, callback, offer) {
  if (callback) {
    var _once: any = (map[name] = _.once(function () {
      offer(name, _once);
      callback.apply(this, arguments);
    }));
    _once._callback = callback;
  }
  return map;
};
