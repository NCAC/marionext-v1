import { _ } from "marionext-lodash";
import { $Dom } from "../marionext-$dom";

export function $html(this: $Dom): string;
export function $html(this: $Dom, html: string): $Dom;
export function $html(this: $Dom, html?: string) {
  if (_.isUndefined(html)) {
    return this[0] && this[0].innerHTML;
  }

  return this.each((i, ele) => {
    ele.innerHTML = html;
  });
}
