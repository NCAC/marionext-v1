import { EleLoose } from "../types";
import { $win } from "../variables";
import { isElement } from "../core/dom_type_checking";

export function $computeStyle(
  ele: EleLoose,
  prop?: string,
  isVariable?: boolean
): string | undefined | CSSStyleDeclaration {
  if (!isElement(ele) || !prop) return;

  const style = $win.getComputedStyle(ele, null);

  return prop
    ? isVariable
      ? style.getPropertyValue(prop) || undefined
      : style[prop]
    : style;
}
