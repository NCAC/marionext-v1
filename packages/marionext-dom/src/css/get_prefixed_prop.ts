import { $div } from "../variables";
import { $isCSSVariable } from "./is_css_variable";
import { $camelCase } from "../core/camel_case";
import { $each } from "../core/each";

export interface $DomStaticPrefixedProp {
  prefixedProp(prop: string, isVariable?: boolean): string;
}

const $prefixedProps: { [prop: string]: string } = {},
  { style } = $div,
  vendorsPrefixes = ["webkit", "moz", "ms"];
export function $getPrefixedProp(
  prop: string,
  isVariable: boolean = $isCSSVariable(prop)
): string {
  if (isVariable) return prop;

  if (!$prefixedProps[prop]) {
    const propCC = $camelCase(prop),
      propUC = `${propCC[0].toUpperCase()}${propCC.slice(1)}`,
      props = `${propCC} ${vendorsPrefixes.join(`${propUC} `)}${propUC}`.split(
        " "
      );

    $each(props, (i, p) => {
      if (p in style) {
        $prefixedProps[prop] = p;

        return false;
      }
    });
  }

  return $prefixedProps[prop];
}

export const $DomStaticPrefixedPropMixin: $DomStaticPrefixedProp = {
  prefixedProp: $getPrefixedProp
};
