import { _ } from "marionext-lodash";

export type offApi = (
  events: _events,
  name: string,
  callback: EventHandler,
  options
) => _events;

// The reducing API that removes a callback from the `events` object.
export const offApi: offApi = function (events, name, callback, options) {
  if (!events) {
    return;
  }

  var context = options.context,
    listeners = options.listeners;

  // Delete all events listeners and "drop" events.
  if (!name && !callback && !context) {
    var ids = _.keys(listeners);
    for (let i = 0; i < ids.length; i++) {
      const listening = listeners[ids[i]];
      delete listeners[listening.id];
      delete listening.listeningTo[listening.objId];
    }
    return;
  }

  const names = name ? [name] : _.keys(events);
  for (let i = 0; i < names.length; i++) {
    name = names[i];
    var handlers = events[name];

    // Bail out if there are no events stored.
    if (!handlers) break;

    // Replace events if there are any remaining.  Otherwise, clean up.
    var remaining = [];
    for (var j = 0; j < handlers.length; j++) {
      var handler = handlers[j];
      if (
        (callback &&
          callback !== handler.callback &&
          callback !== handler.callback._callback) ||
        (context && context !== handler.context)
      ) {
        remaining.push(handler);
      } else {
        const listening = handler.listening;
        if (listening && --listening.count === 0) {
          delete listeners[listening.id];
          delete listening.listeningTo[listening.objId];
        }
      }
    }

    // Update tail event if the list has any events.  Otherwise, clean up.
    if (remaining.length) {
      events[name] = remaining;
    } else {
      delete events[name];
    }
  }
  return events;
};
