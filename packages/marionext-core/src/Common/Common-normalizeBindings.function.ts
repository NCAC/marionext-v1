import { _ } from "marionext-lodash";
import { MnError } from "../Utils/error";
import { normalizeMethods } from "./Common-normalizeMethod.function";

function normalizeBindings(context: any, bindings: ObjectHash) {
  if (!_.isObject(bindings)) {
    throw new MnError({
      message: "Bindings must be an object."
    });
  }

  return normalizeMethods.call(context, bindings);
}

export { normalizeBindings };
