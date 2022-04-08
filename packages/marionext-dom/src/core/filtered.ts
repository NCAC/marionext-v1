// @require collection/filter.ts
import { Comparator } from "./types";
import { $Dom } from "../marionext-dom";

export function filtered(collection: $Dom, comparator?: Comparator): $Dom {
  return !comparator ? collection : collection.filter(comparator);
}
