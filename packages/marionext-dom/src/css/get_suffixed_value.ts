import { _ } from "marionext-lodash";
import { $isCSSVariable } from "./is_css_variable";

const $numericProps: { [prop: string]: true | undefined } = {
  animationIterationCount: true,
  columnCount: true,
  flexGrow: true,
  flexShrink: true,
  fontWeight: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  widows: true,
  zIndex: true
};
export function $getSuffixedValue(
  prop: string,
  value: number | string,
  isVariable: boolean = $isCSSVariable(prop)
): string {
  if (_.isString(value) || (_.isString(value) && isVariable)) {
    return value;
  } else if ($numericProps[prop]) {
    return value.toString();
  } else {
    return `${value}px`;
  }
}
