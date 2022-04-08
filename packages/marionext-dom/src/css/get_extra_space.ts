import { EleLoose } from "../types";
import { $computeStyleInt } from "./compute_style_int";

export function $getExtraSpace(ele: EleLoose, xAxis?: boolean): number {
  return (
    $computeStyleInt(ele, `border${xAxis ? "Left" : "Top"}Width`) +
    $computeStyleInt(ele, `padding${xAxis ? "Left" : "Top"}`) +
    $computeStyleInt(ele, `padding${xAxis ? "Right" : "Bottom"}`) +
    $computeStyleInt(ele, `border${xAxis ? "Right" : "Bottom"}Width`)
  );
}
