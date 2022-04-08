// The reducing API that adds a callback to the `events` object.
export type onApi = (
  events: _events,
  name: string,
  callback: EventHandler,
  options
) => _events;
export const onApi: onApi = function (events, name, callback, options) {
  if (callback) {
    var handlers = events[name] || (events[name] = []);
    var context = options.context,
      ctx = options.ctx,
      listening = options.listening;
    if (listening) listening.count++;

    handlers.push({
      callback: callback,
      context: context,
      ctx: context || ctx,
      listening: listening
    });
  }
  return events;
};
