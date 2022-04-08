// Bind/Unbind Radio Requests
// -----------------------------------------
//
// These methods are used to bind/unbind a backbone.radio request
// to methods on a target object.
//
// The first parameter, `target`, will set the context of the reply method
//
// The second parameter is the `Radio.channel` to bind the reply to.
//
// The third parameter is a hash of { "request:name": "replyHandler" }
// configuration. A function can be supplied instead of a string handler name.

import { _ } from "marionext-lodash";
import { normalizeBindings } from "./Common-normalizeBindings.function";
import { Channel } from "../Radio";

type _bindRequests = (channel: Channel, bindings: ObjectHash) => any;
const _bindRequests: _bindRequests = function _bindRequests(
  channel: Channel,
  bindings
): any {
  if (!channel || !bindings) {
    return this;
  }

  channel.reply(normalizeBindings(this, bindings), this);

  return this;
};

type _unbindRequests = (channel: Channel, bindings: ObjectHash) => any;
const _unbindRequests: _unbindRequests = function _unbindRequests(
  channel: Channel,
  bindings
): any {
  if (!channel) {
    return this;
  }

  if (!bindings) {
    channel.stopReplying(null, null, this);
    return this;
  }

  channel.stopReplying(normalizeBindings(this, bindings));

  return this;
};

export { _bindRequests, _unbindRequests };
