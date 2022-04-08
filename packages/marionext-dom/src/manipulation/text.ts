import { _ } from "marionext-lodash";
import { $Dom } from "../marionext-$dom";

export interface $DomManipulationText {
  text(): string;
  text(text: string): $Dom;
}

export function $text(this: $Dom): string;
export function $text(this: $Dom, text: string): $Dom;
export function $text(this: $Dom, text?: string) {
  if (_.isUndefined(text)) {
    return this[0] ? this[0].textContent : "";
  }

  return this.each((i, ele) => {
    ele.textContent = text;
  });
}

export const $DomManipulationTextMixin: $DomManipulationText = {
  text: $text
};
