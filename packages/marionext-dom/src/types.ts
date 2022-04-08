import { $Dom } from "./marionext-$dom";

export type falsy = undefined | null | false | 0 | "";

export type EleLoose = HTMLElement & Element & Node;

export type EleHTML =
  | HTMLElement
  | HTMLAnchorElement
  // | HTMLAppletElement
  | HTMLAreaElement
  | HTMLAudioElement
  | HTMLBRElement
  | HTMLBaseElement
  // | HTMLBaseFontElement
  | HTMLBodyElement
  | HTMLButtonElement
  | HTMLCanvasElement
  | HTMLDListElement
  | HTMLDataElement
  | HTMLDataListElement
  | HTMLDetailsElement
  | HTMLDialogElement
  | HTMLDirectoryElement
  | HTMLDivElement
  | HTMLEmbedElement
  | HTMLFieldSetElement
  | HTMLFontElement
  | HTMLFormElement
  | HTMLFrameElement
  | HTMLFrameSetElement
  | HTMLHRElement
  | HTMLHeadElement
  | HTMLHeadingElement
  | HTMLHtmlElement
  | HTMLIFrameElement
  | HTMLImageElement
  | HTMLInputElement
  | HTMLLIElement
  | HTMLLabelElement
  | HTMLLegendElement
  | HTMLLinkElement
  | HTMLMapElement
  | HTMLMarqueeElement
  | HTMLMediaElement
  | HTMLMenuElement
  | HTMLMetaElement
  | HTMLMeterElement
  | HTMLModElement
  | HTMLOListElement
  | HTMLObjectElement
  | HTMLOptGroupElement
  | HTMLOptionElement
  | HTMLOrSVGElement
  | HTMLOutputElement
  | HTMLParagraphElement
  | HTMLParamElement
  | HTMLPictureElement
  | HTMLPreElement
  | HTMLProgressElement
  | HTMLQuoteElement
  | HTMLScriptElement
  | HTMLSelectElement
  | HTMLSlotElement
  | HTMLSourceElement
  | HTMLSpanElement
  | HTMLStyleElement
  | HTMLTableCaptionElement
  | HTMLTableCellElement
  | HTMLTableColElement
  | HTMLTableDataCellElement
  | HTMLTableElement
  | HTMLTableHeaderCellElement
  | HTMLTableRowElement
  | HTMLTableSectionElement
  | HTMLTemplateElement
  | HTMLTextAreaElement
  | HTMLTimeElement
  | HTMLTitleElement
  | HTMLTrackElement
  | HTMLUListElement
  | HTMLUnknownElement
  | HTMLVideoElement;
export type EleHTMLLoose = HTMLElement &
  HTMLAnchorElement &
  // HTMLAppletElement &
  HTMLAreaElement &
  HTMLAudioElement &
  HTMLBRElement &
  HTMLBaseElement &
  // HTMLBaseFontElement &
  HTMLBodyElement &
  HTMLButtonElement &
  HTMLCanvasElement &
  HTMLDListElement &
  HTMLDataElement &
  HTMLDataListElement &
  HTMLDetailsElement &
  HTMLDialogElement &
  HTMLDirectoryElement &
  HTMLDivElement &
  HTMLEmbedElement &
  HTMLFieldSetElement &
  HTMLFontElement &
  HTMLFormElement &
  HTMLFrameElement &
  HTMLFrameSetElement &
  HTMLHRElement &
  HTMLHeadElement &
  HTMLHeadingElement &
  HTMLHtmlElement &
  HTMLIFrameElement &
  HTMLImageElement &
  HTMLInputElement &
  HTMLLIElement &
  HTMLLabelElement &
  HTMLLegendElement &
  HTMLLinkElement &
  HTMLMapElement &
  HTMLMarqueeElement &
  HTMLMediaElement &
  HTMLMenuElement &
  HTMLMetaElement &
  HTMLMeterElement &
  HTMLModElement &
  HTMLOListElement &
  HTMLObjectElement &
  HTMLOptGroupElement &
  HTMLOptionElement &
  HTMLOrSVGElement &
  HTMLOutputElement &
  HTMLParagraphElement &
  HTMLParamElement &
  HTMLPictureElement &
  HTMLPreElement &
  HTMLProgressElement &
  HTMLQuoteElement &
  HTMLScriptElement &
  HTMLSelectElement &
  HTMLSlotElement &
  HTMLSourceElement &
  HTMLSpanElement &
  HTMLStyleElement &
  HTMLTableCaptionElement &
  HTMLTableCellElement &
  HTMLTableColElement &
  HTMLTableDataCellElement &
  HTMLTableElement &
  HTMLTableHeaderCellElement &
  HTMLTableRowElement &
  HTMLTableSectionElement &
  HTMLTemplateElement &
  HTMLTextAreaElement &
  HTMLTimeElement &
  HTMLTitleElement &
  HTMLTrackElement &
  HTMLUListElement &
  HTMLUnknownElement &
  HTMLVideoElement;
export type Ele = Window | Document | EleHTML | Element | Node;

export type Selector =
  | falsy
  | string
  | Function
  | HTMLCollection
  | NodeList
  | Ele
  | Ele[]
  | ArrayLike<Ele>
  | $Dom;
export type Comparator =
  | string
  | Ele
  | $Dom
  | ((this: EleLoose, index: number, ele: EleLoose) => boolean);
export type Context = Document | EleHTML | Element;

export type EventCallback = {
  (event: any, data?: any): any;
  guid?: number;
};

export function isNumeric(x: any): x is number {
  return !isNaN(parseFloat(x)) && isFinite(x);
}

export type EachCallback<T> = (this: T, index: number, ele: T) => any;
