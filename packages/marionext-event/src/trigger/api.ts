export type eventTriggerApi = (
  objEvents: _events,
  name: string,
  args: any[]
) => _events;

// A difficult-to-believe, but optimized internal dispatch function for
// triggering events. Tries to keep the usual cases speedy (most internal
// Marionette events have 3 arguments).
const triggerEvents = function (events, args) {
  var ev,
    i = -1,
    l = events.length,
    a1 = args[0],
    a2 = args[1],
    a3 = args[2];
  switch (args.length) {
    case 0:
      while (++i < l) (ev = events[i]).callback.call(ev.ctx);
      return;
    case 1:
      while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1);
      return;
    case 2:
      while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2);
      return;
    case 3:
      while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
      return;
    default:
      while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
      return;
  }
};
export const eventTriggerApi: eventTriggerApi = function (
  objEvents: _events,
  name,
  args
) {
  if (objEvents) {
    var events = objEvents[name];
    var allEvents = objEvents.all;
    if (events && allEvents) {
      allEvents = allEvents.slice();
    }
    if (events) {
      triggerEvents(events, args);
    }
    if (allEvents) {
      triggerEvents(allEvents, [name].concat(args));
    }
  }
  return objEvents;
};
