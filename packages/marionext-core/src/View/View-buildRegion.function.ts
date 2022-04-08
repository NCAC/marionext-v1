import { _ } from "marionext-lodash";
import { MnError } from "../Utils/error";
import { Region } from "../Region";
import { regionsDefinitions } from "./View-region.mixin";

type regionDefinition<T> = string | T[keyof T] | Region;

// return the region instance from the definition
function buildRegion(
  definition: regionDefinition<regionsDefinitions>,
  defaults
): Region {
  if (definition instanceof Region) {
    return definition;
  }

  if (_.isString(definition)) {
    return buildRegionFromObject(defaults, { el: definition });
  }

  if (_.isFunction(definition)) {
    return buildRegionFromObject(defaults, { regionClass: definition });
  }

  if (_.isObject(definition)) {
    return buildRegionFromObject(defaults, definition);
  }

  throw new MnError({
    message: "Improper region configuration type."
  });
}

function buildRegionFromObject(defaults, definition) {
  const options = Object.assign({}, defaults, definition);

  const RegionClass = options.regionClass;

  delete options.regionClass;

  return new RegionClass(options);
}

export { buildRegion };
