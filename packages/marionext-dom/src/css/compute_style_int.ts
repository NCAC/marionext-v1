import { EleLoose } from "../marionext-$dom";
import { $computeStyle } from "./compute_style";

export function $computeStyleInt(ele: EleLoose, prop: string): number {
  const computedStyle = $computeStyle(ele, prop) as string;
  return parseInt(computedStyle, 10) || 0;
}
