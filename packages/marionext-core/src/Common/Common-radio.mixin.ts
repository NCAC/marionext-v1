import { _ } from "marionext-lodash";
import { CommonMixin } from "./Common.mixin";
import { Radio, Channel } from "../Radio";
import { MnError } from "../Utils/error";

// MixinOptions
// - channelName
// - radioEvents
// - radioRequests

interface RadioMixin {
  _channel?: Channel;
  _initRadio(): void;
  _destroyRadio(): void;
  getChannel(): Channel;
}

interface AbstractMixin extends CommonMixin, RadioMixin { }

const RadioMixin: RadioMixin = {
  _initRadio(this: AbstractMixin) {
    const channelName: string = _.result(this, "channelName");

    if (!channelName) {
      return;
    }

    /* istanbul ignore next */
    if (!Radio) {
      throw new MnError({
        message: "The dependency 'Radio' is missing."
      });
    }

    const channel = (this._channel = Radio.channel(channelName));

    const radioEvents = _.result(this, "radioEvents");
    this.bindEvents(channel, radioEvents);

    const radioRequests = _.result(this, "radioRequests");
    this.bindRequests(channel, radioRequests);

    this.on("destroy", this._destroyRadio);
  },

  _destroyRadio(this: AbstractMixin) {
    this._channel.stopReplying(null, null, this);
  },

  getChannel(this: AbstractMixin) {
    return this._channel;
  }
};

export { RadioMixin };
