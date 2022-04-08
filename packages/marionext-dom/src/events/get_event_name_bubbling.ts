import { $eventsFocus, $eventsHover } from "./variables";
export function $getEventNameBubbling(name: string): string {
  return $eventsHover[name] || $eventsFocus[name] || name;
}
