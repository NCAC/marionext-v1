import { EleLoose } from "../marionext-$dom";

export interface $DomStaticMatches {
  matches(ele: any, selector: string): boolean;
}

export function matches(ele: any, selector: string): boolean {
  const matches =
    ele &&
    (ele["matches"] ||
      ele["webkitMatchesSelector"] ||
      ele["msMatchesSelector"]);
  return !!matches && matches.call(ele, selector);
}

export const $DomStaticMatchesMixin: $DomStaticMatches = {
  matches: $matches
};

export function $matches(ele: EleLoose, selector: string): boolean {
  const matches =
    ele &&
    (ele["matches"] ||
      ele["webkitMatchesSelector"] ||
      ele["msMatchesSelector"]);
  return !!matches && matches.call(ele, selector);
}
