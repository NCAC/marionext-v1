import { isDocument, isElement } from "./dom_type_checking";
import { Ele } from "../types";
import { classRe, tagRe, $doc } from "../variables";

export function $find(
  selector: string,
  context: Ele = $doc
): ArrayLike<Element> {
  return !isDocument(context) && !isElement(context)
    ? []
    : classRe.test(selector)
    ? context.getElementsByClassName(selector.slice(1))
    : tagRe.test(selector)
    ? context.getElementsByTagName(selector)
    : context.querySelectorAll(selector);
}
