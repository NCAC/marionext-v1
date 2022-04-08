export const $eventsNamespace = "___ce";
export const $eventsNamespacesSeparator = ".";
export const $eventsFocus: { [event: string]: string | undefined } = {
  focus: "focusin",
  blur: "focusout"
};
export const $eventsHover: { [event: string]: string | undefined } = {
  mouseenter: "mouseover",
  mouseleave: "mouseout"
};
export const $eventsMouseRe = /^(mouse|pointer|contextmenu|drag|drop|click|dblclick)/i;
