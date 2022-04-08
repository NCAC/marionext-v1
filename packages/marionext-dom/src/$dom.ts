import { _ } from "marionext-lodash";

import { VDom } from "marionext-vdom";

import {
  Ele,
  EleLoose,
  Selector,
  Comparator,
  Context,
  EachCallback,
  EventCallback
} from "./types";

import {
  $win,
  $doc,
  htmlRe,
  $idRe,
  $docEle,
  singleTagRe,
  fragmentRe,
  $div,
  $tbody,
  $tr,
  $table,
  HTMLCDATARe,
  scriptAttributes
} from "./variables";

import {
  isDocument,
  isElement,
  isHtmlFormElement,
  isWindow,
  isScriptElement
} from "./core/dom_type_checking";

import { $find } from "./core/find";
import { $getSplitValues } from "./core/get_split_values";
import { $camelCase } from "./core/camel_case";
import { $unique } from "./core/unique";
import { $each } from "./core/each";
import { $matches } from "./core/matches";
import { $attr } from "./core/attr";
import { $queryEncode } from "./core/query_encode";

import { $getSuffixedValue } from "./css/get_suffixed_value";
import { $getPrefixedProp } from "./css/get_prefixed_prop";
import { $computeStyle } from "./css/compute_style";
import { $computeStyleInt } from "./css/compute_style_int";
import { $getExtraSpace } from "./css/get_extra_space";
import { $css } from "./css";

import {
  $eventsFocus,
  $eventsHover,
  $eventsMouseRe,
  $eventsNamespacesSeparator
} from "./events/variables";
import { $getEventNameBubbling } from "./events/get_event_name_bubbling";
import { $getEventsCache } from "./events/get_events_cache";
import { $removeEvent } from "./events/remove_event";
import { $parseEventName } from "./events/parse_event_name";
import { $hasNamespaces } from "./events/has_namespaces";

import { $html } from "./manipulation/html";
import { $text } from "./manipulation/text";

function is$Dom(x: any): x is $Dom {
  return x instanceof $Dom;
}
function $getCompareFunction(
  comparator?: Comparator
): (i: number, ele: EleLoose) => boolean {
  return _.isString(comparator)
    ? (i: number, ele: EleLoose) => $matches(ele, comparator)
    : _.isFunction(comparator)
    ? comparator
    : is$Dom(comparator)
    ? (i: number, ele: EleLoose) => comparator.is(ele)
    : !comparator
    ? () => false
    : (i: number, ele: EleLoose) => ele === comparator;
}

function $extend(target?: any, ...objs: any[]) {
  const l = arguments.length;
  if (!l) {
    return {};
  }
  if (1 === l) {
    return $extend($Dom, target);
  }
  for (let i = 1; i < l; i += 1) {
    for (const key in arguments[i]) {
      target[key] = arguments[i][key];
    }
  }
  return target;
}

const $containers = {
  "*": $div,
  tr: $tbody,
  td: $tr,
  th: $tr,
  thead: $table,
  tbody: $table,
  tfoot: $table
};

function $parseHTML(html: string): EleLoose[] {
  if (!_.isString(html)) return [];

  if (singleTagRe.test(html)) return [VDom.DomApi.createElement(RegExp.$1)];

  const fragment = fragmentRe.test(html) && RegExp.$1,
    container = $containers[fragment] || $containers["*"];

  container.innerHTML = html;

  return $Dom.prototype.init(container.childNodes).detach().get();
}

function $evalScripts(node: Node, doc: Document): void {
  const collection = $dom(node);

  collection
    .filter("script")
    .add(collection.find("script"))
    .each((i, ele: any) => {
      if (isScriptElement(ele) && $docEle.contains(ele)) {
        // The script type is supported // The element is attached to the DOM // Using `documentElement` for broader browser support

        const script = VDom.DomApi.createElement("script") as HTMLScriptElement;

        script.text = ele.textContent.replace(HTMLCDATARe, "");

        $each(scriptAttributes, (i, attr) => {
          if (ele[attr]) {
            (script as HTMLScriptElement)[attr as string] = ele[attr];
          }
        });

        doc.head.insertBefore(script, null);
        doc.head.removeChild(script);
      }
    });
}

function $insertElement(
  anchor: EleLoose,
  target: EleLoose,
  left?: boolean,
  inside?: boolean
): void {
  if (inside) {
    // prepend/append

    anchor.insertBefore(target, left ? anchor.firstElementChild : null);
  } else {
    // before/after

    anchor.parentNode.insertBefore(
      target,
      left ? anchor : anchor.nextElementSibling
    );
  }

  $evalScripts(target, anchor.ownerDocument);
}

function $getScript(url: string, success?: Function): void {
  const script = VDom.DomApi.createElement("script") as HTMLScriptElement,
    $anchor = $dom("script");

  script.async = true;
  script.src = url;

  if (success)
    script.onload = () => {
      success();
    };

  $anchor.before(script);
}

interface $DomInsertSelectorsParams {
  inverse?: boolean;
  left?: boolean;
  inside?: boolean;
  reverseLoopSelectorsArgs?: boolean;
  reverseLoop2?: boolean;
  reverseLoop3?: boolean;
}

function $insertSelectors<T extends ArrayLike<EleLoose> = ArrayLike<EleLoose>>(
  selectors: ArrayLike<Selector>,
  anchors: T,
  params: $DomInsertSelectorsParams
): T {
  $each(
    // walk arguments of $dom(query).operation(selector) ArrayLike<Selector>
    selectors,
    (selectorIndex, selector: Selector) => {
      $each(
        // walk $dom(arguments[i]) => selector
        $dom(selector),
        (targetIndex, target) => {
          $each(
            // walk $dom(this)
            $dom(anchors),
            (anchorIndex, anchor) => {
              const anchorFinal = params.inverse ? target : anchor,
                targetFinal = params.inverse ? anchor : target;

              $insertElement(
                anchorFinal,
                !anchorIndex
                  ? targetFinal
                  : (targetFinal.cloneNode(true) as EleLoose),
                params.left,
                params.inside
              );
            },
            params.reverseLoop3
          );
        },
        params.reverseLoop2
      );
    },
    params.reverseLoopSelectorsArgs
  );

  return anchors;
}

function $getStyleSize(value: string): number | boolean {
  // get a number from a string, not a percentage
  const num = parseFloat(value);
  // not a percent like '100%', and a number
  const isValid = value.indexOf("%") == -1 && !isNaN(num);
  return isValid && num;
}

interface $size {
  width?: number;
  height?: number;
  innerWidth?: number;
  innerHeight?: number;
  outerWidth?: number;
  outerHeight?: number;
  isBorderBox?: boolean;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  borderLeftWidth?: number;
  borderRightWidth?: number;
  borderTopWidth?: number;
  borderBottomWidth?: number;
}
interface $getSize {
  (elem: HTMLElement | Element | string): $size;
  isBoxSizeOuter?: boolean;
}

export const $getSize = (function () {
  // -------------------------- measurements -------------------------- //
  const measurements = [
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "paddingBottom",
    "marginLeft",
    "marginRight",
    "marginTop",
    "marginBottom",
    "borderLeftWidth",
    "borderRightWidth",
    "borderTopWidth",
    "borderBottomWidth"
  ];

  const measurementsLength = measurements.length;

  function getZeroSize() {
    const size: $size = {
      width: 0,
      height: 0,
      innerWidth: 0,
      innerHeight: 0,
      outerWidth: 0,
      outerHeight: 0
    };
    for (var i = 0; i < measurementsLength; i++) {
      var measurement = measurements[i];
      size[measurement] = 0;
    }
    return size;
  }

  // -------------------------- getStyle -------------------------- //

  /**
   * getStyle, get style of element, check for Firefox bug
   * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
   */
  function getStyle(elem: Element) {
    var style = getComputedStyle(elem);
    if (!style) {
      console.error(
        `Style returned ${style}. Are you running this code in a hidden iframe on Firefox? See https://bit.ly/getsizebug1`
      );
    }
    return style;
  }

  // -------------------------- setup -------------------------- //

  let isSetup = false;

  let isBoxSizeOuter: boolean;

  /**
   * setup
   * check isBoxSizerOuter
   * do on first getSize() rather than on page load for Firefox bug
   */
  function setup() {
    // setup once
    if (isSetup) {
      return;
    }
    isSetup = true;

    // -------------------------- box sizing -------------------------- //

    /**
     * Chrome & Safari measure the outer-width on style.width on border-box elems
     * IE11 & Firefox<29 measures the inner-width
     */
    const div = VDom.DomApi.createElement("div");
    div.style.width = "200px";
    div.style.padding = "1px 2px 3px 4px";
    div.style.borderStyle = "solid";
    div.style.borderWidth = "1px 2px 3px 4px";
    div.style.boxSizing = "border-box";

    var body = $doc.body || $docEle;
    body.appendChild(div);
    var style = $computeStyle(div as EleLoose);
    var styleSize = $getStyleSize((style as CSSStyleDeclaration).width);
    // round value for browser zoom. desandro/masonry#928
    if (_.isNumber(styleSize)) {
      isBoxSizeOuter = Math.round(styleSize) == 200;
    } else {
      isBoxSizeOuter = false;
    }
    getSize.isBoxSizeOuter = isBoxSizeOuter;

    body.removeChild(div);
  }

  // -------------------------- getSize -------------------------- //

  var getSize: $getSize = function getSize(elem: HTMLElement) {
    setup();

    var style = getStyle(elem);

    // if hidden, everything is 0
    if (style.display == "none") {
      return getZeroSize();
    }

    var size: $size = {};
    size.width = elem.offsetWidth;
    size.height = elem.offsetHeight;

    var isBorderBox = (size.isBorderBox = style.boxSizing == "border-box");

    // get all measurements
    for (var i = 0; i < measurementsLength; i++) {
      var measurement = measurements[i];
      var value = style[measurement];
      var num = parseFloat(value);
      // any 'auto', 'medium' value will be 0
      size[measurement] = !isNaN(num) ? num : 0;
    }

    var paddingWidth = size.paddingLeft + size.paddingRight;
    var paddingHeight = size.paddingTop + size.paddingBottom;
    var marginWidth = size.marginLeft + size.marginRight;
    var marginHeight = size.marginTop + size.marginBottom;
    var borderWidth = size.borderLeftWidth + size.borderRightWidth;
    var borderHeight = size.borderTopWidth + size.borderBottomWidth;

    var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

    // overwrite width and height if we can get it from style
    var styleWidth = $getStyleSize(style.width);
    if (_.isNumber(styleWidth)) {
      size.width =
        styleWidth +
        // add padding and border unless it's already including it
        (isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth);
    }

    var styleHeight = $getStyleSize(style.height);
    if (_.isNumber(styleHeight)) {
      size.height =
        styleHeight +
        // add padding and border unless it's already including it
        (isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight);
    }

    size.innerWidth = size.width - (paddingWidth + borderWidth);
    size.innerHeight = size.height - (paddingHeight + borderHeight);

    size.outerWidth = size.width + marginWidth;
    size.outerHeight = size.height + marginHeight;

    return size;
  };

  return getSize;
})();

interface $DomStatic {
  fn: $Dom;
  each<T>(arr: ArrayLike<T>, callback: EachCallback<T>): void;
  extend(target: any, ...objs: any[]): any;
  guid: number;
  parseHTML(html: string): EleLoose[];
  unique<T>(arr: ArrayLike<T>): ArrayLike<T>;
  isWindow(x: any): x is Window;
  is$Dom(x: any): x is $Dom;
  getPrefixedProp(prop: string, isVariable?: boolean): string;
  computeStyle(
    ele: EleLoose,
    prop?: string,
    isVariable?: boolean
  ): string | undefined | CSSStyleDeclaration;
  getScript(url: string, success?: Function): void;
}

class $Dom {
  constructor(selector?: Selector, context: Context | $Dom = $doc) {
    if (!selector) return;

    if (is$Dom(selector)) return selector;

    let eles: any = selector;

    if (_.isString(selector)) {
      const ctx = is$Dom(context) ? context[0] : context;

      eles = $idRe.test(selector)
        ? (ctx as Document).getElementById(selector.slice(1))
        : htmlRe.test(selector)
        ? $parseHTML(selector)
        : $find(selector, ctx);

      if (!eles) return;
    } else if (_.isFunction(selector)) {
      return this.ready(selector); //FIXME: `fn.ready` is not included in `core`, but it's actually a core functionality
    }

    if (eles.nodeType || eles === $win) {
      eles = [eles];
    }

    this.length = eles.length;

    for (let i = 0, l = this.length; i < l; i++) {
      this[i] = eles[i];
    }
  }
  init(selector?: Selector, context?: Context | $Dom) {
    return new $Dom(selector, context);
  }
}

const $dom = $Dom.prototype.init as typeof $Dom.prototype.init & $DomStatic;

$dom.fn = $dom.prototype = $Dom.prototype; // Ensuring that `$dom() instanceof $dom`

// Static methods on $dom
Object.assign($dom, {
  each: $each,
  extend: $extend,
  guid: 1,
  parseHTML: $parseHTML,
  unique: $unique,
  is$Dom: is$Dom,
  getPrefixedProp: $getPrefixedProp,
  computeStyle: $computeStyle,
  getScript: $getScript
});

interface $Dom
  extends $DomCss,
    $DomCollection,
    $DomManipulation,
    $DomAttributes,
    $DomData,
    $DomDimensions,
    $DomEvents,
    $DomForm,
    $DomOffset,
    $DomTraversal {
  extend(plugins: Record<string, any>): this;
  ready(callback: Function): this;
  [index: number]: EleLoose | undefined;
  length: number;
  splice(start: number, deleteCount?: number): EleLoose[];
  splice(start: number, deleteCount: number, ...items: Ele[]): EleLoose[];
}

$Dom.prototype.length = 0;
$Dom.prototype.splice = Array.prototype.splice; // Ensuring a $dom collection gets printed as array-like in Chrome's devtools

if (typeof Symbol === "function") {
  // Ensuring a $dom collection is iterable
  $Dom.prototype[Symbol["iterator"]] = Array.prototype[Symbol["iterator"]];
}
$Dom.prototype.extend = function (plugins: Record<string, any>) {
  return $extend($Dom.prototype, plugins);
};

const $JSONStringRe = /^\s+|\s+$/;
function $attempt<T, U>(fn: (arg?: U) => T, arg?: U): T | U {
  try {
    return fn(arg);
  } catch {
    return arg;
  }
}
function $getData(ele: EleLoose, key: string): any {
  const value = ele.dataset[key] || ele.dataset[$camelCase(key)];
  if ($JSONStringRe.test(value)) {
    return value;
  }
  return $attempt(JSON.parse, value);
}
function $setData(ele: EleLoose, key: string, value: any): void {
  value = $attempt(JSON.stringify, value);
  ele.dataset[$camelCase(key)] = value;
}
function $data(this: $Dom): Record<string, any> | undefined;
function $data(this: $Dom, name: string): any;
function $data(this: $Dom, name: string, value: any): $Dom;
function $data(this: $Dom, name: Record<string, any>): $Dom;
function $data(this: $Dom, name?: string | Record<string, any>, value?: any) {
  if (!name) {
    if (!this[0]) return;

    const datas: { [data: string]: any } = {};

    for (const key in this[0].dataset) {
      datas[key] = $getData(this[0], key);
    }

    return datas;
  }

  if (_.isString(name)) {
    if (arguments.length < 2) return this[0] && $getData(this[0], name);

    return this.each((i, ele) => {
      $setData(ele, name, value);
    });
  }

  for (const key in name) {
    this.data(key, name[key]);
  }

  return this;
}

interface $DomManipulation {
  detach(this: $Dom): this;
  after(this: $Dom, ...selectors: Selector[]): this;
  appendTo(this: $Dom, selector: Selector): $Dom;
  append(this: $Dom, ...selectors: Selector[]): this;
  before(this: $Dom, ...selectors: Selector[]): $Dom;
  clone(): $Dom;
  empty(): $Dom;
  html(): string;
  html(html: string): $Dom;
  insertAfter(selector: Selector): $Dom;
  insertBefore(selector: Selector): $Dom;
  prependTo(selector: Selector): $Dom;
  prepend(...selectors: Selector[]): $Dom;
  remove(): $Dom;
  replaceAll(selector: Selector): $Dom;
  replaceWith(selector: Selector): $Dom;
  text(): string;
  text(text: string): $Dom;
  unwrap(): $Dom;
  wrapAll(selector?: Selector): $Dom;
  wrapInner(selector?: Selector): $Dom;
  wrap(selector?: Selector): $Dom;
}
const $DomManipulationMixin: $DomManipulation = {
  detach(this: $Dom) {
    return this.each((i, ele) => {
      if (ele.parentNode) {
        ele.parentNode.removeChild(ele);
      }
    });
  },
  after(this: $Dom) {
    return $insertSelectors(arguments, this, {
      inverse: false,
      left: false,
      inside: false,
      reverseLoopSelectorsArgs: true,
      reverseLoop2: true
    });
  },
  appendTo(this: $Dom, selector: Selector) {
    return $insertSelectors(arguments, this, {
      inverse: true,
      left: false,
      inside: true
    });
  },
  append(this: $Dom) {
    return $insertSelectors(arguments, this, {
      inverse: false,
      left: false,
      inside: true
    });
  },
  before(this: $Dom) {
    return $insertSelectors(arguments, this, { inverse: false, left: true });
  },
  clone(this: $Dom) {
    return this.map((i, ele) => ele.cloneNode(true));
  },
  empty(this: $Dom) {
    return this.each((i, ele) => {
      while (ele.firstChild) {
        ele.removeChild(ele.firstChild);
      }
    });
  },
  html: $html,
  insertAfter(this: $Dom, selector: Selector) {
    return $insertSelectors(arguments, this, {
      inverse: true,
      left: false,
      inside: false,
      reverseLoopSelectorsArgs: false,
      reverseLoop2: false,
      reverseLoop3: true
    });
  },
  insertBefore(this: $Dom, selector: Selector) {
    return $insertSelectors(arguments, this, { inverse: true, left: true });
  },
  prependTo(this: $Dom, selector: Selector) {
    return $insertSelectors(arguments, this, {
      inverse: true,
      left: true,
      inside: true,
      reverseLoopSelectorsArgs: false,
      reverseLoop2: false,
      reverseLoop3: true
    });
  },
  prepend(this: $Dom) {
    return $insertSelectors(arguments, this, {
      inverse: false,
      left: true,
      inside: true,
      reverseLoopSelectorsArgs: true,
      reverseLoop2: true
    });
  },
  remove(this: $Dom) {
    return this.detach().off();
  },
  replaceAll(this: $Dom, selector: Selector) {
    $dom(selector).replaceWith(this);
    return this;
  },
  replaceWith(this: $Dom, selector: Selector) {
    return this.before(selector).remove();
  },
  text: $text,
  unwrap(this: $Dom) {
    this.parent().each((i, ele) => {
      const $ele = $dom(ele);
      $ele.replaceWith($ele.children());
    });
    return this;
  },
  wrapAll(this: $Dom, selector?: Selector) {
    let structure = $dom(selector),
      wrapper: Element = structure[0];

    while (wrapper.children.length) {
      wrapper = wrapper.firstElementChild;
    }

    this.first().before(structure);

    return this.appendTo(wrapper);
  },
  wrapInner(this: $Dom, selector?: Selector) {
    return this.each((i, ele) => {
      const $ele = $dom(ele),
        contents = $ele.contents();

      contents.length ? contents.wrapAll(selector) : $ele.append(selector);
    });
  },
  wrap(this: $Dom, selector?: Selector) {
    return this.each((i, ele) => {
      const wrapper = $dom(selector)[0];

      $dom(ele).wrapAll(!i ? wrapper : wrapper.cloneNode(true));
    });
  }
};

interface $DomAttributes {
  addClass(classes: string): this;
  attr(): undefined;
  attr(attrs: string): string | null;
  attr(attrs: string, value: string): this;
  attr(attrs: Record<string, string>): this;
  hasClass(cls: string): boolean;
  prop(prop: string): any;
  prop(prop: string, value: any): this;
  prop(props: Record<string, any>): this;
  removeAttr(attrs: string): $Dom;
  removeClass(classes?: string): $Dom;
  removeProp(prop: string): $Dom;
  toggleClass(classes: string, force?: boolean): $Dom;
}
const $DomAttributesMixin: $DomAttributes = {
  addClass(this: $Dom, cls: string) {
    return this.toggleClass(cls, true);
  },
  attr: $attr,
  hasClass(this: $Dom, cls: string) {
    return (
      !!cls &&
      Array.prototype.some.call(this, (ele: EleLoose) =>
        ele.classList.contains(cls)
      )
    );
  },
  prop(this: $Dom, prop: string | Record<string, any>, value?: any) {
    if (!prop) return;

    if (_.isString(prop)) {
      if (arguments.length < 2) return this[0] && this[0][prop];

      return this.each((i, ele) => {
        (ele as unknown as HTMLElement)[prop] = value;
      });
    }

    for (const key in prop) {
      this.prop(key, prop[key]);
    }

    return this;
  },
  removeAttr(this: $Dom, attr: string) {
    const attrs = $getSplitValues(attr);

    return this.each((i, ele) => {
      $each(attrs, (i, a) => {
        ele.removeAttribute(a);
      });
    });
  },
  removeClass(this: $Dom, cls?: string) {
    if (arguments.length) {
      return this.toggleClass(cls, false);
    }

    return this.attr("class", "");
  },
  removeProp(this: $Dom, prop: string) {
    return this.each((i, ele) => {
      delete ele[prop];
    });
  },
  toggleClass(this: $Dom, cls: string, force?: boolean) {
    const classes = $getSplitValues(cls),
      isForce = !_.isUndefined(force);

    return this.each((i, ele) => {
      $each(classes, (i, c) => {
        if (isForce) {
          force ? ele.classList.add(c) : ele.classList.remove(c);
        } else {
          ele.classList.toggle(c);
        }
      });
    });
  }
};

interface $DomCollection {
  add(selector: Selector, context?: Context): $Dom;
  each(this: $Dom, callback: EachCallback<EleLoose>): this;
  eq(index: number): $Dom;
  filter(comparator?: Comparator): $Dom;
  first(): $Dom;
  get(): EleLoose[];
  get(index: number): EleLoose | undefined;
  index(selector?: Selector): number;
  last(): $Dom;
  map(callback: MapCallback<EleLoose>): $Dom;
  slice(start?: number, end?: number): $Dom;
}
const $DomCollectionMixin: $DomCollection = {
  add(this: $Dom, selector: Selector, context?: Context) {
    return $dom($unique(this.get().concat($dom(selector, context).get())));
  },
  each(this: $Dom, callback: EachCallback<EleLoose>) {
    return $each(this, callback);
  },
  eq(this: $Dom, index: number) {
    return $dom(this.get(index));
  },
  filter(this: $Dom, comparator?: Comparator) {
    const compare = $getCompareFunction(comparator);

    return $dom(
      Array.prototype.filter.call(this, (ele: EleLoose, i: number) =>
        compare.call(ele, i, ele)
      )
    );
  },
  first(this: $Dom) {
    return this.eq(0);
  },
  get(this: $Dom, index?: number) {
    if (_.isUndefined(index)) {
      return Array.prototype.slice.call(this);
    }
    return this[index < 0 ? index + this.length : index];
  },
  index(this: $Dom, selector?: Selector) {
    const child = selector ? $dom(selector)[0] : this[0],
      collection = selector
        ? this
        : $Dom.prototype.init(child).parent().children();

    return Array.prototype.indexOf.call(collection, child);
  },
  last(this: $Dom) {
    return this.eq(-1);
  },
  map(this: $Dom, callback: MapCallback<EleLoose>) {
    return $dom(
      Array.prototype.map.call(this, (ele: EleLoose, i: number) =>
        callback.call(ele, i, ele)
      )
    );
  },
  slice(this: $Dom, start?: number, end?: number) {
    return $dom(Array.prototype.slice.call(this, start, end));
  }
};

interface $DomCss {
  css(this: $Dom, prop: string): string | undefined;
  css(this: $Dom, prop: string, value: number | string): this;
  css(this: $Dom, props: Record<string, number | string>): this;
}
const $DomCssMixin: $DomCss = {
  css: $css
};

type MapCallback<T> = (this: T, index: number, ele: T) => Ele;

interface $DomData {
  data(): Record<string, any> | undefined;
  data(name: string): any;
  data(name: string, value: any): $Dom;
  data(datas: Record<string, any>): $Dom;
}
const $DomDataMixin: $DomData = {
  data: $data
};

interface $DomDimensions {
  width(): number;
  width(value: number | string): $Dom;
  height(): number;
  height(value: number | string): $Dom;
  outerWidth(includeMargins?: boolean): number | undefined;
  outerHeight(includeMargins?: boolean): number | undefined;
  innerWidth(): number | undefined;
  innerHeight(): number | undefined;
  getSize(): $size;
}
const $DomDimensionsMixin: $DomDimensions = {
  width(this: $Dom, value?: number | string) {
    if (_.isUndefined(this[0])) {
      return _.isUndefined(value) ? undefined : this;
    }
    if (!arguments.length) {
      if (isWindow(this[0])) {
        return this[0][$camelCase("outer-width")];
      }
      return (
        this.get(0).getBoundingClientRect().width -
        $getExtraSpace(this[0], true)
      );
    }
    const valueNumber = parseInt(value.toString(), 10);
    return this.each((i, ele) => {
      if (!isElement(ele)) return;

      const boxSizing = $computeStyle(ele, "boxSizing");

      ele.style.width = $getSuffixedValue(
        "width",
        valueNumber +
          (boxSizing === "border-box" ? $getExtraSpace(ele, true) : 0)
      );
    });
  },
  height(this: $Dom, value?: number | string) {
    if (_.isUndefined(this[0])) {
      return _.isUndefined(value) ? undefined : this;
    }
    if (!arguments.length) {
      if (isWindow(this[0])) {
        return this[0][$camelCase("outer-height")];
      }
      return (
        this.get(0).getBoundingClientRect().height -
        $getExtraSpace(this[0], false)
      );
    }
    const valueNumber = parseInt(value.toString(), 10);
    return this.each((i, ele) => {
      if (!isElement(ele)) return;

      const boxSizing = $computeStyle(ele, "boxSizing");

      ele.style.height = $getSuffixedValue(
        "height",
        valueNumber +
          (boxSizing === "border-box" ? $getExtraSpace(ele, true) : 0)
      );
    });
  },
  outerWidth(this: $Dom, includeMargins?: boolean) {
    if (!this[0]) {
      return;
    }
    if (isWindow(this[0])) {
      return $win.outerWidth;
    }
    if (!includeMargins) {
      return this.get(0).offsetWidth;
    }
    return (
      this.get(0).offsetHeight +
      $computeStyleInt(this.get(0), "marginLeft") +
      $computeStyleInt(this.get(0), "marginRight")
    );
  },
  outerHeight(this: $Dom, includeMargins?: boolean) {
    if (!this[0]) {
      return;
    }
    if (isWindow(this[0])) {
      return $win.outerHeight;
    }
    if (!includeMargins) {
      return this.get(0).offsetHeight;
    }
    return (
      this.get(0).offsetHeight +
      $computeStyleInt(this.get(0), "marginBottom") +
      $computeStyleInt(this.get(0), "marginTop")
    );
  },
  innerWidth(this: $Dom) {
    if (!this[0]) {
      return;
    }
    if (isWindow(this[0])) {
      return $win.innerWidth;
    }
    return this.get(0).clientWidth;
  },
  innerHeight(this: $Dom) {
    if (!this[0]) {
      return;
    }
    if (isWindow(this[0])) {
      return $win.innerHeight;
    }
    return this.get(0).clientHeight;
  },
  getSize(this: $Dom) {
    return $getSize(this.get(0));
  }
};

declare global {
  interface $DomBaseEventObject extends Event {
    /**
     * The current DOM element within the event bubbling phase.
     */
    currentTarget: Element;
    /**
     * An optional object of data passed to an event method when the current executing handler is bound.
     */
    data: any;
    /**
     * The element where the currently-called $Dom event handler was attached.
     */
    delegateTarget: Element;
    /**
     * Returns whether event.preventDefault() was ever called on this event object.
     */
    isDefaultPrevented(): boolean;
    /**
     * Returns whether event.stopImmediatePropagation() was ever called on this event object.
     */
    isImmediatePropagationStopped(): boolean;
    /**
     * Returns whether event.stopPropagation() was ever called on this event object.
     */
    isPropagationStopped(): boolean;
    /**
     * The namespace specified when the event was triggered.
     */
    namespace: string;
    /**
     * The browser's original Event object.
     */
    originalEvent: Event;
    /**
     * If this method is called, the default action of the event will not be triggered.
     */
    preventDefault(): any;
    /**
     * The other DOM element involved in the event, if any.
     */
    relatedTarget: Element;
    /**
     * The last value returned by an event handler that was triggered by this event, unless the value was undefined.
     */
    result: any;
    /**
     * Keeps the rest of the handlers from being executed and prevents the event from bubbling up the DOM tree.
     */
    stopImmediatePropagation(): void;
    /**
     * Prevents the event from bubbling up the DOM tree, preventing any parent handlers from being notified of the event.
     */
    stopPropagation(): void;
    /**
     * The DOM element that initiated the event.
     */
    target: Element;
    /**
     * The mouse position relative to the left edge of the document.
     */
    pageX: number;
    /**
     * The mouse position relative to the top edge of the document.
     */
    pageY: number;
    /**
     * For key or mouse events, this property indicates the specific key or button that was pressed.
     * @deprecated Use `key` for KeyEvents or `button` for MouseEvents instead.
     */
    which: number;
    /**
     * Indicates whether the META key was pressed when the event fired.
     */
    metaKey: boolean;
  }

  interface $DomCustomEventObject extends $DomBaseEventObject {
    /**
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent}
     */
    detail?: any;
  }
  interface $DomInputEventObject extends $DomBaseEventObject {
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
  }
  interface $DomMouseEventObject extends $DomInputEventObject {
    button: number;
    clientX: number;
    clientY: number;
    offsetX: number;
    offsetY: number;
    pageX: number;
    pageY: number;
    screenX: number;
    screenY: number;
  }
  interface $DomKeyEventObject extends $DomInputEventObject {
    /** @deprecated */
    char: string;
    /** @deprecated */
    charCode: number;
    key: string;
    /** @deprecated */
    keyCode: number;
  }

  interface $DomEventObject
    extends $DomBaseEventObject,
      $DomCustomEventObject,
      $DomInputEventObject,
      $DomMouseEventObject,
      $DomKeyEventObject {
    currentTarget: Element;
    delegateTarget: Element;
    isDefaultPrevented(): boolean;
    namespace: string;
    data: any;
    ___cd: boolean; // Delegate
    // relatedTarget?: Node | null;
    ___ifocus?: boolean; // Ignore focus
    ___iblur?: boolean; // Ignore blur
    ___ot?: string; // Original type
    ___td?: boolean; // Trigger data
  }
}

declare global {
  interface $DomEventsOffParams {
    delegate?: string;
  }
}

declare global {
  interface $DomEventsOnParams {
    delegate?: string;
    _one?: boolean;
  }
}

function $addEvent(
  ele: EleLoose,
  name: string,
  namespaces: string[],
  selector: string,
  callback: EventCallback
): void {
  callback.guid = callback.guid || $dom.guid++;

  const eventCache = $getEventsCache(ele);

  eventCache[name] = eventCache[name] || [];
  eventCache[name].push([namespaces, selector, callback]);

  ele.addEventListener(name, callback);
}
interface $DomEventsOneParams {
  delegate?: string;
}

interface $DomEvents {
  off(
    events?: string,
    callback?: EventCallback,
    params?: $DomEventsOffParams
  ): $Dom;
  on(event: string, callback: EventCallback, params?: $DomEventsOnParams): $Dom;
  one(
    event: string,
    callback: EventCallback,
    params?: $DomEventsOneParams
  ): $Dom;
  trigger(event: $DomEventObject | string, data?: any): $Dom;
}
const $DomEventsMixin: $DomEvents = {
  off(this: $Dom, events, callback, offParams: $DomEventsOffParams = {}) {
    if (_.isUndefined(events)) {
      this.each((i, ele) => {
        $removeEvent(ele);
      });
    } else {
      $each($getSplitValues(events), (i, eventFullName) => {
        const [name, namespaces] = $parseEventName(
          $getEventNameBubbling(eventFullName)
        );

        this.each((i, ele) => {
          $removeEvent(ele, name, namespaces, offParams.delegate, callback);
        });
      });
    }

    return this;
  },
  on(
    this: $Dom,
    event: string,
    callback: EventCallback,
    params: $DomEventsOnParams = {}
  ) {
    $each($getSplitValues(event), (i, eventFullName) => {
      const [originalName, namespaces] = $parseEventName(eventFullName),
        name = $getEventNameBubbling(originalName),
        isEventHover = originalName in $eventsHover,
        isEventFocus = originalName in $eventsFocus;

      if (!name) {
        return;
      }

      this.each((i, ele) => {
        if (!isElement(ele) && !isDocument(ele) && !isWindow(ele)) {
          return;
        }
        const finalCallback = function (ev: $DomEventObject) {
          if (ev.target[`___i${ev.type}`]) {
            return ev.stopImmediatePropagation(); // Ignoring native event in favor of the upcoming custom one
          }
          if (
            !params.delegate &&
            ((isEventFocus && (ev.target !== ele || ev.___ot === name)) ||
              (isEventHover &&
                ev.relatedTarget &&
                ele.contains(ev.relatedTarget)))
          ) {
            return;
          }
          if (
            ev.namespace &&
            !$hasNamespaces(
              namespaces,
              ev.namespace.split($eventsNamespacesSeparator)
            )
          ) {
            return;
          }

          let thisArg: EventTarget = ele;

          if (params.delegate) {
            let target = <Node>ev.target;

            while (!$matches(<EleLoose>target, params.delegate)) {
              if (target === ele) return;

              target = target.parentNode;

              if (!target) return;
            }

            thisArg = target;

            ev.___cd = true; // Delegate
          }

          if (ev.___cd) {
            Object.defineProperty(ev, "currentTarget", {
              configurable: true,
              get() {
                // We need to define a getter for this to work everywhere
                return thisArg;
              }
            });
          }

          const returnValue = callback.call(thisArg, ev, ev.data);

          if (params._one) {
            $removeEvent(ele, name, namespaces, params.delegate, finalCallback);
          }

          if (returnValue === false) {
            ev.preventDefault();
            ev.stopPropagation();
          }
        };

        finalCallback.guid = callback.guid = callback.guid || $dom.guid++;

        $addEvent(ele, name, namespaces, params.delegate, finalCallback);
      });
    });

    return this;
  },
  one(this: $Dom, event, callback, params = {}) {
    const onParams = Object.assign(params, { _one: true });
    return this.on(event, callback, onParams);
  },
  trigger(this: $Dom, event: $DomEventObject | string, data?: any) {
    if (_.isString(event)) {
      const [name, namespaces] = $parseEventName(event),
        type = $eventsMouseRe.test(name) ? "MouseEvents" : "HTMLEvents";

      event = $doc.createEvent(type) as $DomEventObject;
      event.initEvent(name, true, true);
      event.namespace = namespaces.join($eventsNamespacesSeparator);
    }

    event.data = data;

    const isEventFocus = event.type in $eventsFocus;

    return this.each((i, ele) => {
      const _event: Event = event as Event;
      if (isEventFocus && _.isFunction(ele[_event.type])) {
        (ele[_event.type] as Function)();
      } else {
        ele.dispatchEvent(_event);
      }
    });
  }
};

function $getValue(ele: HTMLFormElement): string | string[] {
  if (ele.multiple && ele.options) {
    const opts = ele.options;
    const filteredEle: HTMLOptionElement[] = Array.prototype.filter.call(
      opts,
      (option) => {
        option.selected && !option.disabled && !option.parentNode.disabled;
      }
    );
    return filteredEle.map((o) => o.value);
  }

  return ele.value || "";
}

const skippableRe = /file|reset|submit|button|image/i,
  checkableRe = /radio|checkbox/i;

interface $DomForm {
  serialize(): string;
  getValue(this: $Dom): string | string[];
  setValue(this: $Dom, value: string | string[]): $Dom;
  setMultipleValue(this: $Dom, value: string[]): $Dom;
}
const $DomFormMixin: $DomForm = {
  serialize(this: $Dom) {
    let query = "";

    this.each((i, ele) => {
      if (!isHtmlFormElement(ele)) {
        return;
      }
      $each(ele.elements || [ele], (i, ele: HTMLFormElement) => {
        if (
          ele.disabled ||
          !ele.name ||
          ele.tagName === "FIELDSET" ||
          skippableRe.test(ele.type) ||
          (checkableRe.test(ele.type) && !ele.checked)
        )
          return;

        const value = $getValue(ele);

        if (!_.isUndefined(value)) {
          const values = Array.isArray(value) ? value : [value];

          $each(values, (i, value) => {
            query += $queryEncode(ele.name, value);
          });
        }
      });
    });

    return query.slice(1);
  },
  getValue(this: $Dom) {
    if (this[0]) {
      return $getValue(this[0] as HTMLFormElement);
    } else {
      return "";
    }
  },
  setValue(this: $Dom, value: string) {
    return this.each((i, ele) => {
      (ele as unknown as HTMLInputElement).value = value;
    });
  },
  setMultipleValue(this: $Dom, val: string[]) {
    if (isWindow(this[0]) || isDocument(this[0])) {
      return this;
    }
    return this.each((i, ele) => {
      if ("SELECT" === ele.tagName) {
        const eleValue = Array.isArray(val) ? val : _.isNull(val) ? [] : [val];
        $each((ele as unknown as HTMLSelectElement).options, (i, option) => {
          option.selected = eleValue.indexOf(option.value) >= 0;
        });
      } else {
        (ele as unknown as HTMLInputElement).value = val[i];
      }
    });
  }
};

interface $DomOffset {
  offset():
    | undefined
    | {
        top: number;
        left: number;
      };
  offsetParent(): $Dom;
  position():
    | undefined
    | {
        top: number;
        left: number;
      };
}
const $DomOffsetMixin: $DomOffset = {
  offset(this: $Dom) {
    const ele = this[0];
    if (!ele) return;
    const rect = ele.getBoundingClientRect();
    return {
      top: rect.top + $win.pageYOffset - $docEle.clientTop,
      left: rect.left + $win.pageXOffset - $docEle.clientLeft
    };
  },
  offsetParent(this: $Dom) {
    return $dom(this[0] && this[0].offsetParent);
  },
  position(this: $Dom) {
    const ele = this[0];

    if (!ele) return;

    return {
      left: ele.offsetLeft,
      top: ele.offsetTop
    };
  }
};

type PluckCallback<T> = (ele: T) => ArrayLike<Ele>;

function $pluck<T, U extends ArrayLike<T> = ArrayLike<T>>(
  arr: U,
  prop: PluckCallback<U[0]>
): Array<Ele>;

function $pluck<T, U extends ArrayLike<T> = ArrayLike<T>>(
  arr: U,
  prop: string,
  deep?: boolean
): Array<Ele>;

function $pluck<T, U extends ArrayLike<T> = ArrayLike<T>>(
  arr: U,
  prop: string | PluckCallback<U[0]>,
  deep?: boolean
): Array<Ele> {
  const plucked: Array<Ele> = [];

  for (let i = 0, l = arr.length; i < l; i++) {
    if (_.isString(prop)) {
      let val = arr[i][prop];
      while (val != null) {
        plucked.push(val);
        val = deep ? val[prop] : null;
      }
    } else {
      const val = prop(arr[i]);
      if (val.length) {
        Array.prototype.push.apply(plucked, val);
      }
    }
  }

  return plucked;
}

function $filtered(collection: $Dom, comparator?: Comparator): $Dom {
  return !comparator ? collection : collection.filter(comparator);
}

interface $DomTraversal {
  children(comparator?: Comparator): $Dom;
  closest(comparator?: Comparator): $Dom;
  contents(): $Dom;
  find(selector: string): $Dom;
  has(selector: string | Node): $Dom;
  is(comparator?: Comparator): boolean;
  next(comparator?: Comparator, _all?: boolean): $Dom;
  nextAll(comparator?: Comparator): $Dom;
  not(comparator?: Comparator): $Dom;
  parent(comparator?: Comparator): $Dom;
  parents(comparator?: Comparator): $Dom;
  prev(comparator?: Comparator, _all?: boolean): $Dom;
  prevAll(comparator?: Comparator): $Dom;
  siblings(comparator?: Comparator): $Dom;
}
const $DomTraversalMixin: $DomTraversal = {
  children(this: $Dom, comparator?: Comparator) {
    return $filtered(
      $dom($unique($pluck(this, (ele) => ele.children))),
      comparator
    );
  },
  closest(this: $Dom, comparator?: Comparator) {
    const filtered = this.filter(comparator);

    if (filtered.length) return filtered;

    const $parent = this.parent();

    if (!$parent.length) return filtered;

    return $parent.closest(comparator);
  },
  contents(this: $Dom) {
    return $dom(
      $unique(
        $pluck(this, (ele) =>
          ele.tagName === "IFRAME"
            ? [(ele as HTMLIFrameElement).contentDocument]
            : ele.childNodes
        )
      )
    );
  },
  find(this: $Dom, selector: string) {
    return $dom($unique($pluck(this, (ele) => $find(selector, ele))));
  },
  has(this: $Dom, selector: string | Node) {
    const comparator: Comparator = _.isString(selector)
      ? (i: number, ele: EleLoose) => $find(selector, ele).length > 0
      : (i: number, ele: EleLoose) => ele.contains(selector);

    return this.filter(comparator);
  },
  is(this: $Dom, comparator?: Comparator) {
    const compare = $getCompareFunction(comparator);

    return Array.prototype.some.call(this, (ele: EleLoose, i: number) =>
      compare.call(ele, i, ele)
    );
  },
  next(this: $Dom, comparator?: Comparator, _all?: boolean) {
    return $filtered(
      $dom($unique($pluck(this, "nextElementSibling", _all))),
      comparator
    );
  },
  nextAll(this: $Dom, comparator?: Comparator) {
    return this.next(comparator, true);
  },
  not(this: $Dom, comparator?: Comparator) {
    const compare = $getCompareFunction(comparator);

    return this.filter(
      (i: number, ele: EleLoose) => !compare.call(ele, i, ele)
    );
  },
  parent(this: $Dom, comparator?: Comparator) {
    return $filtered($dom($unique($pluck(this, "parentNode"))), comparator);
  },
  parents(this: $Dom, comparator?: Comparator) {
    return $filtered(
      $dom($unique($pluck(this, "parentElement", true))),
      comparator
    );
  },
  prev(this: $Dom, comparator?: Comparator, _all?: boolean) {
    return $filtered(
      $dom($unique($pluck(this, "previousElementSibling", _all))),
      comparator
    );
  },
  prevAll(this: $Dom, comparator?: Comparator) {
    return this.prev(comparator, true);
  },
  siblings(this: $Dom, comparator?: Comparator) {
    return $filtered(
      $dom(
        $unique($pluck(this, (ele) => $dom(ele).parent().children().not(ele)))
      ),
      comparator
    );
  }
};

Object.assign(
  $Dom.prototype,
  {
    extend(plugins: Record<string, any>) {
      return $dom.extend($Dom.prototype, plugins);
    },
    ready(this: $Dom, callback: Function) {
      if ($doc.readyState !== "loading") {
        callback($dom);
      } else {
        $doc.addEventListener("DOMContentLoaded", () => {
          callback($dom);
        });
      }

      return this;
    }
  },
  $DomAttributesMixin,
  $DomManipulationMixin,
  $DomCollectionMixin,
  $DomCssMixin,
  $DomDataMixin,
  $DomDimensionsMixin,
  $DomEventsMixin,
  $DomFormMixin,
  $DomOffsetMixin,
  $DomTraversalMixin
);

declare global {
  interface i$Dom extends $Dom {}
}

export { $Dom, $dom, $DomStatic };
