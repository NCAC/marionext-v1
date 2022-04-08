import { VDom } from "marionext-vdom";
export const $doc = document;
export const $win = window;
export const $docEle = $doc.documentElement;
// export const $createElement = $doc.createElement.bind($doc);
export const $div = VDom.DomApi.createElement("div");
export const $table = VDom.DomApi.createElement("table");
export const $tbody = VDom.DomApi.createElement("tbody");
export const $tr = VDom.DomApi.createElement("tr");

export const $idRe = /^#(?:[\w-]|\\.|[^\x00-\xa0])*$/;
export const classRe = /^\.(?:[\w-]|\\.|[^\x00-\xa0])*$/;
export const htmlRe = /<.+>/;
export const tagRe = /^\w+$/;

export const dashAlphaRe = /-([a-z])/g;

export const fragmentRe = /^\s*<(\w+)[^>]*>/;
export const singleTagRe = /^\s*<(\w+)\s*\/?>(?:<\/\1>)?\s*$/;

export const HTMLCDATARe = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
export const scriptAttributes = ["type", "src", "nonce", "noModule"] as const;
