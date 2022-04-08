import { EleLoose, EventCallback } from "../types";
import { $eventsNamespace } from "./variables";

export function $getEventsCache(
  ele: EleLoose
): { [event: string]: [string[], string, EventCallback][] } {
  return (ele[$eventsNamespace] = ele[$eventsNamespace] || {});
}
