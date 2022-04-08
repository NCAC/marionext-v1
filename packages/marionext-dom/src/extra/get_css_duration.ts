import { $Dom } from "../marionext-dom";
import { computeStyle } from "../css/compute_style";

export interface $DomGetCssDuration {
  getCssDuration(cssProps: string | string[]): number;
}

export const $DomGetCssDurationMixin: $DomGetCssDuration = {
  getCssDuration(this: $Dom, cssProps) {
    const el = this.get(0);
    let durString: string,
      isMs: boolean,
      matchDuration,
      result = 0;
    if (Array.isArray(cssProps)) {
      cssProps.forEach((cssProp) => {
        durString = (computeStyle(el, cssProp) as string).toLowerCase();
        isMs = durString.indexOf("ms") >= 0;
        matchDuration = durString.match(/\d+(\.\d+)?/g);
        if (isMs) {
          result = result + parseInt(matchDuration[0], 10);
        } else {
          result = result + parseFloat(matchDuration[0]) * 1000;
        }
      });
    } else {
      durString = (computeStyle(el, cssProps) as string).toLowerCase();
      isMs = durString.indexOf("ms") >= 0;
      matchDuration = durString.match(/\d+(\.\d+)?/g);
      if (isMs) {
        result = result + parseInt(matchDuration[0], 10);
      } else {
        result = result + parseFloat(matchDuration[0]) * 1000;
      }
    }

    return result;
  }
};
