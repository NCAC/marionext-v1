import { _ } from "marionext-lodash";
import { $Dom } from "../marionext-$dom";

export function $attr(this: $Dom): undefined;
export function $attr(this: $Dom, attr: string): string | null;
export function $attr(this: $Dom, attr: string, value: string): $Dom;
export function $attr(this: $Dom, attr: Record<string, string>): $Dom;
export function $attr(
  this: $Dom,
  attr?: string | Record<string, string>,
  value?: string
) {
  if (!attr) return;

  if (_.isString(attr)) {
    if (arguments.length < 2) {
      if (!this[0]) return;

      const value = this[0].getAttribute(attr);

      return _.isNull(value) ? undefined : value;
    }

    if (_.isUndefined(value)) return this;

    if (_.isNull(value)) return this.removeAttr(attr);

    return this.each((i, ele) => {
      ele.setAttribute(attr, value);
    });
  }

  for (const key in attr) {
    this.attr(key, attr[key]);
  }

  return this;
}
