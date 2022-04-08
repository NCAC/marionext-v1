// Backbone.Radio v2.0.0
import { _ } from "marionext-lodash";
import { EventMixin } from "marionext-event";

export interface RadioMixinOptions {
  // Defines the Radio channel that will be used for the requests and/or
  // events.
  channelName?: string;

  // Defines an events hash with the events to be listened and its respective
  // handlers.
  radioEvents?: any;

  // Defines an events hash with the requests to be replied and its respective
  // handlers
  radioRequests?: any;
}

/*
 * Radio.Requests
 * -----------------------
 * A messaging system for requesting data.
 */
interface Requests {
  request(requestName: string, ...args: any[]): any;
  reply(
    requestName: string,
    callback: (...args: any[]) => any,
    context?: any
  ): Requests;
  reply(
    commands: { [key: string]: (...args: any[]) => any },
    context?: any
  ): Requests;
  replyOnce(
    requestName: string,
    callback: (...args: any[]) => any,
    context?: any
  ): Requests;
  replyOnce(
    commands: { [key: string]: (...args: any[]) => any },
    context?: any
  ): Requests;
  stopReplying(
    commandName?: string,
    callback?: (...args: any[]) => any,
    context?: any
  ): Requests;
}

interface Radio {
  // Whether or not we're in DEBUG mode or not. DEBUG mode helps you
  // get around the issues of lack of warnings when events are mis-typed.
  DEBUG: boolean;

  // Format debug text.
  _debugText(warning: string, eventName: string, channelName?: string): string;

  // This is the method that's called when an unregistered event was called.
  // By default, it logs warning to the console. By overriding this you could
  // make it throw an Error, for instance. This would make firing a nonexistent event
  // have the same consequence as firing a nonexistent method on an Object.
  debugLog(warning: string, eventName: string, channelName?: string): void;

  Requests: Requests;

  // An internal method used to handle Radio's method overloading for Requests.
  // It's borrowed from Events. It differs from Backbone's overload
  // API (which is used in Backbone.Events) in that it doesn't support space-separated
  // event names.
  _eventsApi(obj, action, name, rest?: any): any;

  // An optimized way to execute callbacks.
  _callHandler(callback, context, args): any;

  // Log information about the channel and event
  log(channelName, eventName): string | void;

  // Logs all events on this channel to the console. It sets an
  // internal value on the channel telling it we're listening,
  // then sets a listener on the Events
  tuneIn(channelName): Radio;

  // Stop logging all of the activities on this channel to the console
  tuneOut(channelName): Radio;
}

const Radio = {
  DEBUG: false,
  _debugText(warning, eventName, channelName) {
    return (
      warning +
      (channelName ? " on the " + channelName + " channel" : "") +
      ': "' +
      eventName +
      '"'
    );
  },
  debugLog(this: Radio, warning, eventName, channelName) {
    if (this.DEBUG && console && console.warn) {
      console.warn(this._debugText(warning, eventName, channelName));
    }
  }
} as Radio;

Radio._eventsApi = function (obj, action, name, rest) {
  if (!name) {
    return false;
  }

  const eventSplitter = /\s+/;
  const _typeof =
    typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
      ? function (obj) {
        return typeof obj;
      }
      : function (obj) {
        return obj &&
          typeof Symbol === "function" &&
          obj.constructor === Symbol
          ? "symbol"
          : typeof obj;
      };
  var results = {};

  // Handle event maps.
  if (
    (typeof name === "undefined" ? "undefined" : _typeof(name)) === "object"
  ) {
    for (var key in name) {
      var result = obj[action].apply(obj, [key, name[key]].concat(rest));
      eventSplitter.test(key)
        ? Object.assign(results, result)
        : (results[key] = result);
    }
    return results;
  }

  // Handle space separated event names.
  if (eventSplitter.test(name)) {
    var names = name.split(eventSplitter);
    for (var i = 0, l = names.length; i < l; i++) {
      results[names[i]] = obj[action].apply(obj, [names[i]].concat(rest));
    }
    return results;
  }

  return false;
};
Radio._callHandler = function (callback, context, args) {
  var a1 = args[0],
    a2 = args[1],
    a3 = args[2];
  switch (args.length) {
    case 0:
      return callback.call(context);
    case 1:
      return callback.call(context, a1);
    case 2:
      return callback.call(context, a1, a2);
    case 3:
      return callback.call(context, a1, a2, a3);
    default:
      return callback.apply(context, args);
  }
};

/*
 * tune-in
 * -------
 * Get console logs of a channel's activity
 *
 */
var _logs = {};

Radio.log = function log(channelName, eventName) {
  if (typeof console === "undefined") {
    return;
  }
  var args = _.toArray(arguments).slice(2);
  console.log("[" + channelName + '] "' + eventName + '"', args);
};
Object.assign(
  Radio,
  (function () {
    // This is to produce an identical function in both tuneIn and tuneOut,
    // so that Backbone.Events unregisters it.
    function _partial(channelName) {
      return (
        _logs[channelName] ||
        (_logs[channelName] = Radio.log.bind(Radio, channelName))
      );
    }
    return {
      tuneIn: function (this: Radio, channelName) {
        var channel = this.channel(channelName);
        channel._tunedIn = true;
        channel.on("all", _partial(channelName));
        return this;
      },
      tuneOut: function (this: Radio, channelName) {
        var channel = this.channel(channelName);
        channel._tunedIn = false;
        channel.off("all", _partial(channelName));
        delete _logs[channelName];
        return this;
      }
    };
  })()
);

interface Radio {
  _channels: { [key: string]: Channel };

  // Get a reference to a channel by name.
  channel(channelName: string): Channel;
}
Radio._channels = {};
Radio.channel = function (this: Radio, channelName) {
  if (!channelName) {
    throw new Error("You must provide a name for the channel.");
  }

  if (this._channels[channelName]) {
    return this._channels[channelName];
  } else {
    return (this._channels[channelName] = new Channel(channelName));
  }
};

const Requests = {} as Requests;

Object.assign(
  Requests,
  (function () {
    function makeCallback(callback) {
      return _.isFunction(callback)
        ? callback
        : function () {
          return callback;
        };
    }

    // A helper used by `off` methods to the handler from the store
    function removeHandler(store, name, callback, context) {
      var event = store[name];
      if (
        (!callback ||
          callback === event.callback ||
          callback === event.callback._callback) &&
        (!context || context === event.context)
      ) {
        delete store[name];
        return true;
      }
    }

    function removeHandlers(
      store: ObjectHash = {},
      name: string,
      callback,
      context
    ) {
      var names = name ? [name] : Object.keys(store);
      var matched = false;

      for (let i = 0, length = names.length; i < length; i++) {
        name = names[i];

        // If there's no event by this name, log it and continue
        // with the loop
        if (!store[name]) {
          continue;
        }

        if (removeHandler(store, name, callback, context)) {
          matched = true;
        }
      }

      return matched;
    }

    return {
      // Make a request
      request: function request(this: Channel, name) {
        var args = _.toArray(arguments).slice(1);
        var results = Radio._eventsApi(this, "request", name, args);
        if (results) {
          return results;
        }
        var channelName = this.channelName;
        var requests = this._requests;

        // Check if we should log the request, and if so, do it
        if (channelName && this._tunedIn) {
          Radio.log.apply(this, [channelName, name].concat(args));
        }

        // If the request isn"t handled, log it in DEBUG mode and exit
        if (requests && (requests[name] || requests["default"])) {
          var handler = requests[name] || requests["default"];
          args = requests[name] ? args : _.toArray(arguments);
          return Radio._callHandler(handler.callback, handler.context, args);
        } else {
          Radio.debugLog("An unhandled request was fired", name, channelName);
        }
      },

      // Set up a handler for a request
      reply: function reply(this: Channel, name, callback, context) {
        if (Radio._eventsApi(this, "reply", name, [callback, context])) {
          return this;
        }

        this._requests || (this._requests = {});

        if (this._requests[name]) {
          Radio.debugLog("A request was overwritten", name, this.channelName);
        }

        this._requests[name] = {
          callback: makeCallback(callback),
          context: context || this
        };

        return this;
      },

      // Set up a handler that can only be requested once
      replyOnce: function replyOnce(this: Channel, name, callback, context) {
        if (Radio._eventsApi(this, "replyOnce", name, [callback, context])) {
          return this;
        }

        var self = this;

        var once = once(function () {
          self.stopReplying(name);
          return makeCallback(callback).apply(this, arguments);
        });

        return this.reply(name, once, context);
      },

      // Remove handler(s)
      stopReplying: function stopReplying(
        this: Channel,
        name,
        callback,
        context
      ) {
        if (Radio._eventsApi(this, "stopReplying", name)) {
          return this;
        }

        // Remove everything if there are no arguments passed
        if (!name && !callback && !context) {
          delete this._requests;
        } else if (!removeHandlers(this._requests, name, callback, context)) {
          Radio.debugLog(
            "Attempted to remove the unregistered request",
            name,
            this.channelName
          );
        }

        return this;
      }
    };
  })()
);

Radio.Requests = Requests;

interface Channel extends EventMixin, Requests {
  channelName: string;

  // Remove all handlers from the messaging systems of this channel
  reset(): Channel;
  _tunedIn: boolean;
  _requests: any;
  _events: any;
}
class Channel {
  // A Channel is an object that extends from Backbone.Events,
  // and Radio.Requests.
  constructor(channelName: string) {
    this.channelName = channelName;
  }
}

Object.assign(Channel.prototype, EventMixin, Requests, {
  reset: function (this: Channel) {
    this.off();
    this.stopListening();
    this.stopReplying();
    return this;
  }
});

/*
 * Top-level API
 * -------------
 * Supplies the 'top-level API' for working with Channels directly from Radio.
 */
interface Radio extends EventMixin, Requests {
  reset(channelName?: string);
}
Radio.reset = function (this: Radio, channelName?: string) {
  var channels = !channelName
    ? this._channels
    : { channelName: this._channels[channelName] };
  _.each(channels, function (channel) {
    channel.reset();
  });
};
Object.assign(Radio, EventMixin, Requests);

export { Radio, Channel };
