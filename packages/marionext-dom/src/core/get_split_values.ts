import { _ } from "marionext-lodash";

export const $splitValuesRe = /\S+/g;

export function $getSplitValues(str: string) {
  return _.isString(str) ? str.match($splitValuesRe) || [] : [];
}
