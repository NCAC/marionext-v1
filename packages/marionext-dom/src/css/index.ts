import { _ } from "marionext-lodash";
import { $Dom } from "../marionext-$dom";
import { isElement } from "../core/dom_type_checking";

import { $getPrefixedProp } from "./get_prefixed_prop";
import { $isCSSVariable } from "./is_css_variable";
import { $getSuffixedValue } from "./get_suffixed_value";
import { $computeStyle } from "./compute_style";
import {
  $DomStaticPrefixedProp,
  $DomStaticPrefixedPropMixin
} from "./get_prefixed_prop";

export interface $DomCss {
  css(this: $Dom, prop: string): string | undefined;
  css(this: $Dom, prop: string, value: number | string): this;
  css(this: $Dom, props: Record<string, number | string>): this;
}

export function $css(this: $Dom, prop: string): string | undefined;
export function $css(this: $Dom, prop: string, value: number | string): $Dom;
export function $css(this: $Dom, prop: Record<string, number | string>): $Dom;
export function $css(
  this: $Dom,
  prop: string | Record<string, number | string>,
  value?: number | string
) {
  if (_.isString(prop)) {
    const isVariable = $isCSSVariable(prop);

    prop = $getPrefixedProp(prop, isVariable);

    if (arguments.length < 2)
      return this[0] && $computeStyle(this[0], prop, isVariable);

    if (!prop) return this;

    value = $getSuffixedValue(prop, value, isVariable);

    return this.each((i, ele) => {
      if (!isElement(ele)) return;

      if (isVariable) {
        ele.style.setProperty(prop as string, value.toString());
      } else {
        ele.style[prop as string] = value;
      }
    });
  }

  for (const key in prop) {
    this.css(key, prop[key]);
  }

  return this;
}

export const $DomCssMixin: $DomCss = {
  css: $css
};

/**
 * Type '{ (this: $Dom, prop: string): string; (this: $Dom, prop: string, value: string | number): $Dom; (this: $Dom, prop: Record<string, string | number>): $Dom; }' is not assignable to type '{ (prop: string): string; (prop: string, value: string | number): $DomCss; (props: Record<string, string | number>): $DomCss; }'.
  Type 'string' is not assignable to type '$DomCss'.
*/

export interface $DomStaticCss extends $DomStaticPrefixedProp {}
export const $DomStaticCssMixin: $DomStaticCss = Object.assign(
  {},
  $DomStaticPrefixedPropMixin
);
