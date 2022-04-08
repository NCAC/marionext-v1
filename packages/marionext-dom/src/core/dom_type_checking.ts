const scriptTypeRe = /^$|^module$|\/(java|ecma)script/i;

export function isScriptElement(x: any): x is HTMLScriptElement {
  return scriptTypeRe.test(x.type);
}

export function isHtmlFormElement(el: any): el is HTMLFormElement {
  return "FORM" === el.tagName;
}

export function isWindow(x: any): x is Window {
  return !!x && x === x.window;
}

export function isDocument(x: any): x is Document {
  return !!x && x.nodeType === 9;
}

export function isElement(x: any): x is HTMLElement {
  return !!x && x.nodeType === 1;
}
