import * as Snabbdom from "snabbdom";
declare global {
  interface ObjectHash {
    [key: string]: any;
  }
  interface StringHash {
    [key: string]: string;
  }
  type Many<T> = T | ReadonlyArray<T>;
  interface Dictionary<T> {
    [index: string]: T;
  }
  type AnyKindOfDictionary =
    | Dictionary<{} | null | undefined>
    | NumericDictionary<{} | null | undefined>;
  type PartialDeep<T> = {
    [P in keyof T]?: PartialDeep<T[P]>;
  };
  type GlobalPartial<T> = Partial<T>;
  type PartialObject<T> = GlobalPartial<T>;
  type NotVoid = {} | null | undefined;
  type PropertyName = string | number | symbol;
  type PropertyPath = Many<PropertyName>;
  // type Omit<T, K extends keyof T> = Pick<T, ({ [P in keyof T]: P } & { [P in K]: never } & { [x: string]: never })[keyof T]>;
  type IterateeShorthand<T> =
    | PropertyName
    | [PropertyName, any]
    | PartialDeep<T>;
  type ListIteratee<T> = ListIterator<T, NotVoid> | IterateeShorthand<T>;
  type ObjectIteratee<TObject> =
    | ObjectIterator<TObject, NotVoid>
    | IterateeShorthand<TObject[keyof TObject]>;
  type ValueIteratee<T> = ((value: T) => NotVoid) | IterateeShorthand<T>;
  type List<T> = ArrayLike<T>;
  type ListIterator<T, TResult> = (
    value: T,
    index: number,
    collection: List<T>
  ) => TResult;
  type ObjectIterator<TObject, TResult> = (
    value: TObject[keyof TObject],
    key: string,
    collection: TObject
  ) => TResult;
  type MemoObjectIterator<T, TResult, TList> = (
    prev: TResult,
    curr: T,
    key: string,
    list: TList
  ) => TResult;
  interface ThrottleSettings {
    /**
     * If you'd like to disable the leading-edge call, pass this as false.
     */
    leading?: boolean;
    /**
     * If you'd like to disable the execution on the trailing-edge, pass false.
     */
    trailing?: boolean;
  }
  interface Cancelable {
    cancel(): void;
    flush(): void;
  }
  interface NumericDictionary<T> {
    [index: number]: T;
  }
}
type func = (...args: any[]) => any;
type isFunction = (value: any) => value is func;
interface _ {
  /**
   * Creates a shallow clone of value.
   */
  clone<T>(value: T): T;
  /**
   * This method is like _.clone except that it recursively clones value.
   */
  cloneDeep<T>(value: T): T;
  /**
   * Checks if value is a callable function.
   */
  isFunction: isFunction;
  /**
   * Checks if value is classified as a Number primitive or object.
   */
  isNumber(value?: any): value is number;
  /**
   * Checks if value is classified as a RegExp object.
   */
  isRegExp(value?: any): value is RegExp;
  /**
   * Checks if value is empty. A value is considered empty unless it’s an arguments object, array, string, or
   * jQuery-like collection with a length greater than 0 or an object with own enumerable properties.
   */
  isEmpty(value?: any): boolean;
  /**
   * Checks if value is undefined.
   */
  isUndefined(value: any): value is undefined;
  /**
   * Checks if value is null.
   */
  isNull(value?: any): value is null;
  /**
   * Checks if value is the language type of Object. (e.g. arrays, functions, objects, regexes, new Number(0),
   * and new String(''))
   */
  isObject(value?: any): boolean;
  /**
   * Checks if value is a plain object, that is, an object created by the Object constructor or one with a
   * [[Prototype]] of null.
   */
  isPlainObject(value?: any): boolean;
  /**
   * Checks if value is classified as a String primitive or object.
   */
  isString(value?: any): value is string;
  /**
   * Performs a deep comparison between two values to determine if they are
   * equivalent.
   */
  isEqual(value: any, other: any): boolean;
  /**
   * Converts value to an array.
   */
  toArray<T>(
    value: List<T> | Dictionary<T> | NumericDictionary<T> | null | undefined
  ): T[];
  toArray<T>(value: T): Array<T[keyof T]>;
  toArray(): any[];
  noop(): void;
  /**
   * Creates a function that performs a deep comparison between a given object and source, returning true if the
   * given object has equivalent property values, else false.
   */
  matches<T>(source: T): (value: any) => boolean;
  /**
   * Generates a unique ID. If prefix is provided the ID is appended to it.
   */
  uniqueId(prefix?: string): string;
  /**
   * Creates a duplicate-free version of an array, using
   * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
   * for equality comparisons, in which only the first occurrence of each element
   * is kept.
   */
  uniq<T>(array: List<T> | null | undefined): T[];
  /**
   * Creates a slice of array with n elements dropped from the end.
   */
  dropRight<T>(array: List<T> | null | undefined, n?: number): T[];
  /**
   * Creates an array excluding all provided values using SameValueZero for equality comparisons.
   */
  without<T>(array: List<T> | null | undefined, ...values: T[]): T[];
  /**
   * Gets the size of collection by returning its length for array-like values or the number of own enumerable
   * properties for objects.
   */
  size(collection: object | string | null | undefined): number;
  /**
   * Creates an object composed of keys generated from the results of running each element of collection through
   * iteratee. The corresponding value of each key is the number of times the key was returned by iteratee. The
   * iteratee is invoked with one argument: (value).
   */
  countBy<T extends object>(
    collection: T | null | undefined,
    iteratee?: ValueIteratee<T[keyof T]>
  ): Dictionary<number>;
  /**
   * Iterates over elements of collection invoking iteratee for each element. The iteratee is invoked with three arguments:
   * (value, index|key, collection). Iteratee functions may exit iteration early by explicitly returning false.
   */
  each<T>(collection: List<T>, iteratee?: ListIterator<T, any>): List<T>;
  each<T extends object>(collection: T, iteratee?: ObjectIterator<T, any>): T;
  /**
   * Invokes the method named by methodName on each element in the collection returning
   * an array of the results of each invoked method. Additional arguments will be provided
   * to each invoked method. If methodName is a function it will be invoked for, and this
   * bound to, each element in the collection.
   */
  invokeMap(
    collection: object | null | undefined,
    methodName: string,
    ...args: any[]
  ): any[];
  invokeMap<TResult>(
    collection: object | null | undefined,
    method: (...args: any[]) => TResult,
    ...args: any[]
  ): TResult[];
  /**
   * Reduces a collection to a value which is the accumulated result of running each
   * element in the collection through the callback, where each successive callback execution
   * consumes the return value of the previous execution. If accumulator is not provided the
   * first element of the collection will be used as the initial accumulator value. The callback
   * is invoked with four arguments: (accumulator, value, index|key, collection).
   */
  reduce<T extends object>(
    collection: T | null | undefined,
    callback: MemoObjectIterator<T[keyof T], T[keyof T], T>
  ): T[keyof T] | undefined;
  reduce<T extends object, TResult>(
    collection: T | null | undefined,
    callback: MemoObjectIterator<T[keyof T], TResult, T>,
    accumulator: TResult
  ): TResult;
  /**
   * Gets a random element from collection.
   */
  sample<T>(
    collection:
      | List<T>
      | Dictionary<T>
      | NumericDictionary<T>
      | null
      | undefined
  ): T | undefined;
  sample<T extends object>(
    collection: T | null | undefined
  ): T[keyof T] | undefined;
  /**
   * Creates an array of shuffled values, using a version of the Fisher-Yates shuffle.
   */
  shuffle<T>(collection: List<T> | null | undefined): T[];
  shuffle<T extends object>(
    collection: T | null | undefined
  ): Array<T[keyof T]>;
  /**
   * Creates an array of elements, sorted in ascending order by the results of
   * running each element in a collection through each iteratee. This method
   * performs a stable sort, that is, it preserves the original sort order of
   * equal elements. The iteratees are invoked with one argument: (value).
   */
  sortBy<T>(
    collection: List<T> | null | undefined,
    ...iteratees: Array<Many<ListIteratee<T>>>
  ): T[];
  sortBy<T extends object>(
    collection: T | null | undefined,
    ...iteratees: Array<Many<ObjectIteratee<T>>>
  ): Array<T[keyof T]>;
  /**
   * Assigns own enumerable properties of source object(s) to the destination object for all destination
   * properties that resolve to undefined. Once a property is set, additional values of the same property are
   * ignored.
   */
  defaults<TObject, TSource>(
    object: TObject,
    source: TSource
  ): TSource & TObject;
  defaults<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2
  ): TSource2 & TSource1 & TObject;
  defaults<TObject, TSource1, TSource2, TSource3>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): TSource3 & TSource2 & TSource1 & TObject;
  defaults<TObject, TSource1, TSource2, TSource3, TSource4>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): TSource4 & TSource3 & TSource2 & TSource1 & TObject;
  defaults<TObject>(object: TObject): TObject;
  defaults(object: any, ...sources: any[]): any;
  /**
   * This method is like _.find except that it returns the key of the first element predicate returns truthy for
   * instead of the element itself.
   *
   * @param object The object to search.
   * @param predicate The function invoked per iteration.
   * @return Returns the key of the matched element, else undefined.
   */
  findKey<T>(
    object: T | null | undefined,
    predicate?: ObjectIteratee<T>
  ): string | undefined;
  /**
   * Checks if `path` is a direct property of `object`.
   */
  has<T>(object: T, path: PropertyPath): boolean;
  /**
   * Creates an object composed of the inverted keys and values of object. If object contains duplicate values,
   * subsequent values overwrite property assignments of previous values unless multiValue is true.
   */
  invert(object: object): Dictionary<string>;
  /**
   * Invokes the method at path of object.
   */
  invoke(object: any, path: PropertyPath, ...args: any[]): any;
  /**
   * Creates an array of the own enumerable property names of object.
   */
  keys(object?: any): string[];
  /**
   * The opposite of `_.pick`; this method creates an object composed of the
   * own and inherited enumerable properties of `object` that are not omitted.
   */
  omit<T extends AnyKindOfDictionary>(
    object: T | null | undefined,
    ...paths: Array<Many<PropertyName>>
  ): T;
  omit<T extends object, K extends keyof T>(
    object: T | null | undefined,
    ...paths: Array<Many<K>>
  ): Omit<T, K>;
  omit<T extends object>(
    object: T | null | undefined,
    ...paths: Array<Many<PropertyName>>
  ): PartialObject<T>;
  /**
   * Creates an object composed of the picked `object` properties.
   */
  pick<T extends object, U extends keyof T>(
    object: T,
    ...props: Array<Many<U>>
  ): Pick<T, U>;
  pick<T>(
    object: T | null | undefined,
    ...props: PropertyPath[]
  ): PartialDeep<T>;
  /**
   * This method is like _.get except that if the resolved value is a function it’s invoked with the this binding
   * of its parent object and its result is returned.
   */
  result<TResult>(
    object: any,
    path: PropertyPath,
    defaultValue?: TResult | ((...args: any[]) => TResult)
  ): TResult;
  /**
   * Converts the characters "&", "<", ">", '"', "'", and "`" in string to their corresponding HTML entities.
   */
  escape(string?: string): string;
  /**
   * Creates an object composed of keys generated from the results of running each element of collection through
   * iteratee. The corresponding value of each key is an array of the elements responsible for generating the
   * key. The iteratee is invoked with one argument: (value).
   */
  groupBy<T>(
    collection: List<T> | null | undefined,
    iteratee?: ValueIteratee<T>
  ): Dictionary<T[]>;
  groupBy<T extends object>(
    collection: T | null | undefined,
    iteratee?: ValueIteratee<T[keyof T]>
  ): Dictionary<Array<T[keyof T]>>;
  /**
   * Creates a throttled function that only invokes func at most once per every wait milliseconds. The throttled
   * function comes with a cancel method to cancel delayed invocations and a flush method to immediately invoke
   * them. Provide an options object to indicate that func should be invoked on the leading and/or trailing edge
   * of the wait timeout. Subsequent calls to the throttled function return the result of the last func call.
   *
   * Note: If leading and trailing options are true, func is invoked on the trailing edge of the timeout only if
   * the the throttled function is invoked more than once during the wait timeout.
   *
   * @param func The function to throttle.
   * @param wait The number of milliseconds to throttle invocations to.
   * @param options The options object.
   * @param options.leading Specify invoking on the leading edge of the timeout.
   * @param options.trailing Specify invoking on the trailing edge of the timeout.
   * @return Returns the new throttled function.
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: ThrottleSettings
  ): T & Cancelable;
  /**
   * Invokes func after wait milliseconds. Any additional arguments are provided to func when it’s invoked.
   */
  delay(func: (...args: any[]) => any, wait: number, ...args: any[]): number;
  /**
   * Creates a function that is restricted to invoking func once. Repeat calls to the function return the value
   * of the first call. The func is invoked with the this binding and arguments of the created function.
   */
  once<T extends (...args: any[]) => any>(func: T): T;
}
declare const _: _;
type falsy = undefined | null | false | 0 | "";
type EleLoose = HTMLElement & Element & Node;
type EleHTML =
  | HTMLElement
  | HTMLAnchorElement
  | HTMLAreaElement
  | HTMLAudioElement
  | HTMLBRElement
  | HTMLBaseElement
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
type Ele = Window | Document | EleHTML | Element | Node;
type Selector =
  | falsy
  | string
  | Function
  | HTMLCollection
  | NodeList
  | Ele
  | Ele[]
  | ArrayLike<Ele>
  | $Dom;
type Comparator =
  | string
  | Ele
  | $Dom
  | ((this: EleLoose, index: number, ele: EleLoose) => boolean);
type Context = Document | EleHTML | Element;
type EventCallback = {
  (event: any, data?: any): any;
  guid?: number;
};
type EachCallback<T> = (this: T, index: number, ele: T) => any;
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
declare class $Dom {
  constructor(selector?: Selector, context?: Context | $Dom);
  init(selector?: Selector, context?: Context | $Dom): $Dom;
}
declare const $dom: ((selector?: Selector, context?: Context | $Dom) => $Dom) &
  $DomStatic;
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
interface $DomCss {
  css(this: $Dom, prop: string): string | undefined;
  css(this: $Dom, prop: string, value: number | string): this;
  css(this: $Dom, props: Record<string, number | string>): this;
}
type MapCallback<T> = (this: T, index: number, ele: T) => Ele;
interface $DomData {
  data(): Record<string, any> | undefined;
  data(name: string): any;
  data(name: string, value: any): $Dom;
  data(datas: Record<string, any>): $Dom;
}
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
interface $DomForm {
  serialize(): string;
  getValue(this: $Dom): string | string[];
  setValue(this: $Dom, value: string | string[]): $Dom;
  setMultipleValue(this: $Dom, value: string[]): $Dom;
}
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
declare global {
  interface i$Dom extends $Dom {}
}
interface EventMixinListenTo {
  // Inversion-of-control versions of `on`. Tell *this* object to listen to
  // an event in another object... keeping track of what it's listening to
  // for easier unbinding later.
  listenTo(object: EventMixinObj, events: string, callback: EventHandler): this;
  listenTo(object: EventMixinObj, eventMap: EventMap): this;
}
declare const EventMixinListenTo: EventMixinListenTo;
interface EventMixinOn extends EventMixinListenTo {
  // Bind an event to a `callback` function. Passing `"all"` will bind
  // the callback to all events fired.
  on(eventName: string, callback: EventHandler, context?: any): this;
  on(eventMap: EventMap): this;
}
declare const EventMixinOn: EventMixinOn;
interface EventMixinOnce {
  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, its listener will be removed. If multiple events
  // are passed in using the space-separated syntax, the handler will fire
  // once for each event, not once for a combination of all events.
  once(eventsName: string, callback: EventHandler, context: any): EventMixin;
  // Inversion-of-control versions of `once`.
  listenToOnce(
    obj: EventMixinObj,
    events: string,
    callback: EventHandler
  ): EventMixin;
}
declare const EventMixinOnce: EventMixinOnce;
interface EventMixinStopListening {
  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  stopListening(
    obj?: EventMixinObj,
    eventName?: string | EventMap,
    callback?: EventHandler
  ): EventMixin;
}
declare const EventMixinStopListening: EventMixinStopListening;
interface EventMixinOff extends EventMixinStopListening {
  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `name` is null, removes all bound
  // callbacks for all events.
  off(eventName?: string, callback?: EventHandler, context?: any): this;
}
declare const EventMixinOff: EventMixinOff;
interface EventMixinTrigger {
  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  trigger(eventName: string, ...args: any[]): any;
}
declare const EventMixinTrigger: EventMixinTrigger;
declare global {
  interface EventHandler {
    (...args: any[]): void;
    _callback?: EventHandler;
  }
  interface EventMap {
    [event: string]: EventHandler;
  }
  interface _events {
    [key: string]: _recordedEvents[];
  }
}
interface _recordedEvents {
  callback: EventHandler;
  context: any;
  ctx: any;
  listening: any;
}
interface _listenings {
  [key: string]: {
    obj: any;
    objId: string;
    id: string;
    listeningTo?: _listenings;
    count: number;
  };
}
interface EventMixinObjProps {
  _events?: _events;
  _listeners?: _listenings;
  _listeningTo?: _listenings;
  _listenId?: string;
}
interface EventMixin
  extends EventMixinOn,
    EventMixinOnce,
    EventMixinOff,
    EventMixinTrigger,
    EventMixinObjProps {}
interface EventMixinObj extends EventMixin {
  [key: string]: any;
}
declare const EventMixin: EventMixin;
declare global {
  interface ListenToHash {
    [key: string]: string | ((...args: any[]) => void);
  }
}
type CollectionPredicate = string | object | ListIterator<Model, boolean>;
interface CollectionSetOptions {
  silent?: boolean;
  add?: boolean;
  remove?: boolean;
  merge?: boolean;
  index?: number;
  changes?: ObjectHash;
  at?: number;
  sort?: boolean;
  parse?: boolean;
}
interface Collection<TModel extends Model> extends EventMixin {
  extend(properties: any, classProperties?: any): any;
  models: TModel[];
  length: number;
  constructor: {
    new (models?: TModel[] | Object[], options?: any): Collection<TModel>;
  };
  /**
   * Specify a model attribute name (string), an array of attribute names (string[]) or function that will be used to sort the collection.
   */
  comparator: string | string[] | ((compare: TModel, to: TModel) => number);
  pluck(attribute: string): any[];
  /**
   * Sets the url property (or function) on a collection to reference its location on the server.
   *
   * @memberof Collection
   */
  url: string | (() => string);
  without(...values: TModel[]): TModel[];
}
declare class Collection<TModel extends Model> {
  static extend: (this: typeof Collection, protoProps: ObjectHash) => any;
  constructor(models?: TModel[], options?: any);
}
interface Collection<TModel extends Model> {
  // Private method to reset all internal state. Called when the collection
  // is first initialized or reset.
  _reset(): void;
  _byId: any;
}
interface Collection<TModel extends Model> {
  // The default model for a collection is just a **Model**.
  // This should be overridden in most cases.
  model: new (...args: any[]) => TModel;
}
interface Collection<TModel extends Model> {
  preinitialize(): void;
  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize(models?: TModel[] | Object[], options?: any): void;
}
interface Collection<TModel extends Model> {
  // The JSON representation of a Collection is an array of the
  // models' attributes.
  toJSON(options?: any): any;
}
interface Collection<TModel extends Model> {
  // Add a model, or list of models to the set. `models` may be Backbone
  // Models or raw JavaScript objects to be converted to Models, or any
  // combination of the two.
  add(
    model: object | TModel | object[] | TModel[],
    options?: AddOptions
  ): TModel[] | TModel;
}
interface Collection<TModel extends Model> {
  // Remove a model, or a list of models from the set.
  remove(models: TModel | TModel[], options?: Silenceable): TModel | TModel[];
}
interface Collection<TModel> {
  // **parse** converts a response into the hash of attributes to be `set` on
  // the model. The default implementation is just to pass the response along.
  parse(response: any, options?: any): any;
}
interface Collection<TModel extends Model> {
  // Update a collection by `set`-ing a new list of models, adding new ones,
  // removing models that are no longer present, and merging models that
  // already exist in the collection, as necessary. Similar to **Model#set**,
  // the core operation for updating the data contained by the collection.
  set(
    models?: TModel[] | TModel,
    options?: CollectionSetOptions
  ): TModel[] | TModel;
}
interface Collection<TModel extends Model> {
  reset(models?: TModel[] | TModel, options?: Silenceable): TModel[] | TModel;
}
interface Collection<TModel extends Model> {
  // Add a model to the end of the collection.
  push(model: TModel, options?: AddOptions): TModel;
}
interface Collection<TModel extends Model> {
  // Remove a model from the end of the collection.
  pop(options?: Silenceable): TModel;
}
interface Collection<TModel extends Model> {
  // Add a model to the beginning of the collection.
  unshift(model: TModel, options?: AddOptions): TModel;
}
interface Collection<TModel extends Model> {
  // Remove a model from the beginning of the collection.
  shift(options?: Silenceable): TModel;
}
interface Collection<TModel extends Model> {
  // Slice out a sub-array of models from the collection.
  slice(min?: number, max?: number): TModel[];
}
interface Collection<TModel extends Model> {
  // Get a model from the set by id, cid, model object with id or cid
  // properties, or an attributes object that is transformed through modelId.
  get(id: number | string | TModel): TModel;
}
interface Collection<TModel extends Model> {
  // Returns `true` if the model is in the collection.
  has(key: number | string | TModel): boolean;
}
interface Collection<TModel extends Model> {
  // Get the model at the given index.
  at(index: number): TModel;
}
interface Collection<TModel extends Model> {
  where(properties: any, first?: boolean): TModel | TModel[];
}
interface Collection<TModel extends Model> {
  // Return the first model with matching attributes. Useful for simple cases
  // of `find`.
  findWhere(properties: any): TModel;
}
interface Collection<TModel extends Model> {
  // Force the collection to re-sort itself. You don't need to call this under
  // normal circumstances, as the set will maintain sort order as each item
  // is added.
  sort(options?: Silenceable): Collection<TModel>;
}
interface Collection<TModel extends Model> {
  // Pluck an attribute from each model in the collection.
  pluck(attribute: string): any[];
}
interface Collection<TModel extends Model> {}
interface Collection<TModel extends Model> {
  // Create a new collection with an identical list of models as this one.
  clone(): Collection<Model>;
}
interface Collection<TModel extends Model> {
  // Define how to uniquely identify models in the collection.
  modelId(attrs: any): any;
}
interface Collection<TModel extends Model> {}
interface Collection<TModel extends Model> {
  // Prepare a hash of attributes (or other model) to be added to this
  // collection.
  _prepareModel(attributes?: any, options?: any): any;
}
interface Collection<TModel extends Model> {
  _removeModels(models: TModel[], options: any): TModel[];
}
interface Collection<TModel extends Model> {
  // Method for checking whether an object should be considered a model for
  // the purposes of adding to the collection.
  _isModel(model: TModel | TModel[]): boolean;
}
interface Collection<TModel extends Model> {
  // Internal method to create a model's ties to a collection.
  _addReference(model: TModel): void;
}
interface Collection<TModel extends Model> {
  // Internal method to sever a model's ties to a collection.
  _removeReference(model: TModel, options?: any): void;
}
interface Collection<TModel extends Model> {
  // Internal method called every time a model in the set fires an event.
  // Sets need to update their indexes when models change ids. All other
  // events simply proxy through. "add" and "remove" events that originate
  // in other collections are ignored.
  _onModelEvent(
    event: string,
    model: TModel,
    collection: Collection<TModel>,
    options: any
  ): void;
}
// interface Collection<TModel extends Model> {
//   // Create a new instance of a model in this collection. Add the model to the
//   // collection immediately, unless `wait: true` is passed, in which case we
//   // wait for the server to agree.
//   create(attributes: any, options?: ModelSaveOptions): TModel;
// }
// CollectionProto.create = function (this: Collection<Model>, model, options) {
//   options = options ? _.clone(options) : {};
//   var wait = options.wait;
//   model = this._prepareModel(model, options);
//   if (!model) return false;
//   if (!wait) this.add(model, options);
//   var collection = this;
//   var success = options.success;
//   options.success = function (m, resp, callbackOpts) {
//     if (wait) collection.add(m, callbackOpts);
//     if (success) success.call(callbackOpts.context, m, resp, callbackOpts);
//   };
//   model.save(null, options);
//   return model;
// }
interface Collection<TModel extends Model> {
  sortBy(key: string | string[], sort?: "asc" | "desc"): TModel[];
}
interface Collection<TModel extends Model> {
  forEach(iterator: ListIterator<TModel, void>, context?: any): void;
}
interface Collection<TModel extends Model> {
  indexOf(value: TModel, from?: number): number;
  lastIndexOf(value: TModel, from?: number): number;
}
interface Collection<TModel extends Model> {
  findIndex(predicate: CollectionPredicate): number;
}
interface Collection<TModel extends Model> {
  // returns all the models that pass a truth test.
  filter(predicate: CollectionPredicate): TModel[];
}
interface Collection<TModel extends Model> {
  // returns the value of the first model in the collection that satisfies the provided testing predicate.
  find(predicate: CollectionPredicate): TModel;
}
interface Collection<TModel extends Model> {
  // returns the number of models in the collection.
  size(): number;
}
interface Collection<TModel extends Model> {
  first(n?: number): TModel | TModel[];
}
interface Collection<TModel extends Model> {
  // tests whether at least one element in the models passes the test implemented by the provided predicate.
  some(predicate: CollectionPredicate, context?: any): boolean;
}
interface Collection<TModel extends Model> {
  // test if all models pass the test implemented by the provided predicate.
  every(predicate: CollectionPredicate): boolean;
}
interface Collection<TModel extends Model> {
  // Returns true if the model is present in the models.
  contains(value: TModel): boolean;
}
interface Collection<TModel extends Model> {
  shuffle(): TModel[];
}
interface Collection<TModel extends Model> {
  isEmpty(): boolean;
}
interface Collection<TModel extends Model> {
  countBy(predicate?: CollectionPredicate): Dictionary<number>;
}
interface Collection<TModel extends Model> {
  groupBy(
    predicate: string | object | ListIterator<TModel, any>,
    context?: any
  ): Dictionary<TModel[]>;
}
interface Collection<TModel extends Model> {
  map<TResult>(
    iterator: ListIterator<TModel, TResult>,
    context?: any
  ): TResult[];
}
interface Collection<TModel extends Model> {
  sample(): TModel;
}
/**
 * Model
 * --------------
 */
/**
 * Marionette **Models** are the basic data object in the framework --
 * frequently representing a row in a table in a database on your server.
 * A discrete chunk of data and a bunch of useful, related methods for
 * performing computations and transformations on that data.
 *
 * Create a new model with the specified attributes. A client id (`cid`)
 * is automatically generated and assigned for you.
 */
interface Model extends EventMixin {
  extend(properties: any, classProperties?: any): any;
  // The prefix is used to create the client id which is used to identify models locally.
  // You may want to override this if you"re experiencing name clashes with model ids.
  cidPrefix: string;
  cid: string;
  attributes: ObjectHash;
  _previousAttributes: ObjectHash;
  collection?: Collection<any>; // Collection<any> but avoid circular dependency here, merge interface Model in marionext with correct type
  // A hash of attributes whose current and previous value differ.
  changed: any;
  _pending: boolean;
  _changing: boolean;
}
declare class Model {
  static extend: (this: typeof Model, protoProps: ObjectHash) => any;
  constructor(attributes?: ObjectHash, options?: ObjectHash);
}
interface Model {
  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize(): void;
}
interface Model {
  /**
   * Default attributes for the model. It can be an object hash or a method returning an object hash.
   * For assigning an object hash, do it like this: this.defaults = <any>{ attribute: value, ... };
   * That works only if you set it in the constructor or the initialize method.
   **/
  defaults(): ObjectHash;
  id: any;
  // The default name for the JSON `id` attribute is `"id"`. MongoDB and
  // CouchDB users may want to set this to `"_id"`.
  idAttribute: string;
  // The value returned during the last failed validation.
  validationError: any;
}
interface Model {
  toJSON(options?: any): ObjectHash;
}
interface Model {
  get(attr: string): any;
}
interface Model {
  // Get the HTML-escaped value of an attribute.
  escape(attr: string): string;
}
interface Model {
  // Returns `true` if the attribute contains a value that is not null
  // or undefined.
  has(attr: string): boolean;
}
interface Model {
  matches(attrs: string | ObjectHash): boolean;
}
interface Model {
  // **parse** converts a response into the hash of attributes to be `set` on
  // the model. The default implementation is just to pass the response along.
  parse(response: any, options?: any): any;
}
interface Model {
  // Set a hash of model attributes on the object, firing `"change"`. This is
  // the core primitive operation of a model, updating the data and notifying
  // anyone who needs to know about the change in state. The heart of the beast.
  // set(obj: any, options?: ModelSetOptions): Model | boolean;
  // set(attributeName: string, value: any, options?: ModelSetOptions): Model | boolean;
  set(key: string | object, val?: any, options?: any): Model | boolean;
  // Remove an attribute from the model, firing `"change"`. `unset` is a noop
  // if the attribute doesn"t exist.
  unset(attribute: string, options?: Silenceable): Model;
}
interface Model {
  // Clear all attributes on the model, firing `"change"`.
  clear(options?: Silenceable): any;
}
interface Model {
  // Determine if the model has changed since the last `"change"` event.
  // If you specify an attribute name, determine if that attribute has changed.
  hasChanged(attr?: string): boolean;
}
interface Model {
  hasChanged(attribute?: string): boolean;
}
interface Model {
  /**
   * Return an object containing all the attributes that have changed, or
   * false if there are no changed attributes. Useful for determining what
   * parts of a view need to be updated and/or what attributes need to be
   * persisted to the server. Unset attributes will be set to undefined.
   * You can also pass an attributes object to diff against the model,
   * determining if there *would be* a change. */
  changedAttributes(diff: any): any;
}
interface Model {
  // Get the previous value of an attribute, recorded at the time the last
  // `"change"` event was fired.
  previous(attribute: string): any;
  // Get all of the attributes of the model at the time of the previous
  // `"change"` event.
  previousAttributes(): ObjectHash;
}
interface Model {
  // Create a new model with identical attributes to this one.
  clone(): Model;
}
interface Model {
  // Check if the model is currently in a valid state.
  isValid(options?: any): boolean;
  // Run validation against the next complete set of model attributes,
  // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
  _validate(attributes: any, options?: any): any;
  // This method is left undefined and you're encouraged to override it
  // with any custom validation logic you have that can be performed in JavaScript.
  validate?: (attrs: ObjectHash, options?: any) => boolean;
}
interface Model {
  // mixins from lodash
  keys(): string[];
  values(): any[];
  pairs(): any[];
  invert(): any;
  pick(keys: string[]): any;
  pick(...keys: string[]): any;
  pick(fn: (value: any, key: any, object: any) => any): any;
  omit(keys: string[]): any;
  omit(...keys: string[]): any;
  omit(fn: (value: any, key: any, object: any) => any): any;
  isEmpty(): boolean;
  matches(attrs: any): boolean;
}
declare global {
  interface Silenceable {
    silent?: boolean;
    changes?: any;
  }
  interface AddOptions extends Silenceable {
    at?: number;
    merge?: boolean;
    sort?: boolean;
  }
  interface Validable {
    validate?: boolean;
  }
  interface ModelSetOptions extends Silenceable, Validable {}
}
declare namespace VDom {
  function makeHtmlNode(html: string | Element): any;
  function compileAttributes(attributes: any, attributeBlocks: any): any;
  function text(str: string): string;
  const patch: (
    oldVnode: Element | DocumentFragment | Snabbdom.VNode,
    vnode: Snabbdom.VNode
  ) => Snabbdom.VNode;
  const h: typeof Snabbdom.h;
  const vnode: typeof Snabbdom.vnode;
  type VNode = Snabbdom.VNode;
  const toVNode: typeof Snabbdom.toVNode;
  const DomApi: Snabbdom.DOMAPI & {
    createBuffer(): DocumentFragment;
    getEl(selector: string | Element | $Dom): $Dom;
    findEl(el: Element, selector: string, _$el?: $Dom): $Dom;
    hasEl(el: Element, childEl: Element): boolean;
    detachEl(el: Element, _$el?: $Dom): void;
    replaceEl(newEl: Element, oldEl: Element): void;
    swapEl(el1: Element, el2: Element): void;
    setContents(el: Element, html: string, _$el?: $Dom): void;
    appendContents(
      el: DocumentFragment | Element,
      contents: string | Element | DocumentFragment,
      {
        _$el,
        _$contents
      }?: {
        _$el?: $Dom;
        _$contents?: $Dom;
      }
    ): void;
    hasContents(el: Element): boolean;
    detachContents(el: Element, _$el?: $Dom): void;
  };
  // Static setter
  type tSetDomApi = (mixin?: any) => any;
  const setDomApi: tSetDomApi;
}
type handler = {
  route: RegExp;
  callback: Function;
};
type handlers = handler[];
interface BrowserHistoryOptions {
  pushState?: boolean;
  root?: string;
  silent?: boolean;
  validateHash?: boolean;
}
interface BrowserHistory extends BrowserHistoryOptions, EventMixin {
  options: any;
  instance: BrowserHistory;
  getInstance(): BrowserHistory;
  handlers: handlers;
  _hashes: any[];
  location?: Location;
  history?: History;
  started: boolean;
  interval: number;
  _checkUrlInterval?: number;
  fragment: string;
  iframe?: HTMLIFrameElement;
  _wantsHashChange: boolean;
  _hasHashChange: boolean;
  _useHashChange: boolean;
  _wantsPushState: boolean;
  _hasPushState: boolean;
  _usePushState: boolean;
  validateHash: boolean;
}
declare class BrowserHistory {
  static instance: BrowserHistory;
  static getInstance(): BrowserHistory;
  // Has the history handling already been started?
  static started: boolean;
  private constructor();
}
interface BrowserHistory {
  // Are we at the app root?
  atRoot(): boolean;
  // Does the pathname match the root?
  matchRoot(): boolean;
}
interface BrowserHistory {
  // Unicode characters in `location.pathname` are percent encoded so they're
  // decoded for comparison. `%25` should not be decoded since it may be part
  // of an encoded parameter.
  decodeFragment(fragment: string): string;
}
interface BrowserHistory {
  // In IE6, the hash fragment and search params are incorrect if the
  // fragment contains `?`.
  getSearch(): string;
  // Gets the true hash value. Cannot use location.hash directly due to bug
  // in Firefox where location.hash will always be decoded.
  getHash(window?: Window): string;
  // Get the pathname and search params, without the root.
  getPath(): string;
  // Get the cross-browser normalized URL fragment from the path or hash.
  getFragment(fragment?: string): string;
}
interface BrowserHistory {
  // Start the hash change handling, returning `true` if the current URL matches
  // an existing route, and `false` otherwise.
  start(options?: BrowserHistoryOptions): boolean;
  // Disable history, perhaps temporarily. Not useful in a real app,
  // but possibly useful for unit testing Routers.
  stop(): void;
}
interface BrowserHistory {
  // Add a route to be tested when the fragment changes. Routes added later
  // may override previous routes.
  route(route: RegExp, callback: Function): void;
}
interface BrowserHistory {
  // Checks the current URL to see if it has changed, and if it has,
  // calls `loadUrl`, normalizing across the hidden iframe.
  checkUrl(): void | boolean;
  // Attempt to load the current URL fragment. If a route succeeds with a
  // match, returns `true`. If no defined routes matches the fragment,
  // returns `false`.
  loadUrl(fragmentOverride?: string): boolean;
}
interface BrowserHistory {
  // Save a fragment into the hash history, or replace the URL state if the
  // 'replace' option is passed. You are responsible for properly URL-encoding
  // the fragment in advance.
  //
  // The options object can contain `trigger: true` if you wish to have the
  // route callback be fired (not usually desirable), or `replace: true`, if
  // you wish to modify the current URL without adding an entry to the history.
  navigate(fragment: string, options?: any): boolean | void;
}
interface BrowserHistory {
  // Update the hash location, either replacing the current entry, or adding
  // a new one to the browser history.
  _updateHash(location: Location, fragment: string, replace: boolean): void;
}
interface BrowserHistory {
  _subscribeToEvents(): void;
  _hashChanged(): void;
  _isHashInRoutes(hash: string): boolean;
  _checkDefaultHash(): void;
  _addHash(hash: string): any;
  getPreviousHash(): string;
}
declare const BrowserHistoryInstance: BrowserHistory;
declare const _bindEvents: (entity: any, bindings: ObjectHash) => any;
declare const _unbindEvents: (entity: any, bindings: ObjectHash) => any;
// Trigger an event and/or a corresponding method name. Examples:
//
// `this.triggerMethod("foo")` will trigger the "foo" event and
// call the "onFoo" method.
//
// `this.triggerMethod("foo:bar")` will trigger the "foo:bar" event and
// call the "onFooBar" method.
type triggerMethod = (eventName: string, ...args: any[]) => any;
declare const triggerMethod: (event: string, ...args: any[]) => any;
// Marionette.normalizeMethods
// ----------------------
// Pass in a mapping of events => functions or function names
// and return a mapping of events => functions
type normalizeMethods = (hash: any) => any;
declare const normalizeMethods: normalizeMethods;
type _setOptions = (options: ObjectHash, classOptions: string[]) => void;
declare const _setOptions: _setOptions;
// Marionette.getOptions
// --------------------
type getOptions = (optionName: string) => any;
// Retrieve an object, function or other value from the
// object or its `options`, with `options` taking precedence.
declare const getOptions: getOptions;
// Merge `keys` from `options` onto `this`
type mergeOptions = (options: ObjectHash, keys: any[]) => void;
declare const mergeOptions: mergeOptions;
type ControllerHash = {
  [index: string]: Function;
};
interface RouterOptions {
  // root Url
  root?: string;
  /**
   * Define the app routes and the method names on the controller that
   * will be called when accessing the routes.
   */
  appRoutes?: StringHash;
  /**
   * Define the app routes and the method names on the router that will be
   * called when accessing the routes.
   */
  routes?: StringHash;
  /**
   * An object that contains the methods specified in appRoutes.
   */
  controller?: ControllerHash;
}
interface Router extends EventMixin {
  bindEvents: typeof _bindEvents;
  unbindEvents: typeof _unbindEvents;
  normalizeMethod: normalizeMethods;
  triggerMethod: triggerMethod;
  _setOptions: _setOptions;
  getOptions: getOptions;
  mergeOptions: mergeOptions;
  routes: StringHash;
  appRoutes: StringHash;
  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize(): void;
  /**
   * Add an app route at runtime.
   */
  appRoute(route: string, methodName: string): void;
  /**
   * Specify a controller with the multiple routes at runtime. This will
   * preserve the existing controller as well.
   */
  processAppRoutes(controller: ControllerHash, appRoutes: StringHash): void;
  /**
   * An object that contains the methods specified in appRoutes.
   */
  controller: any;
  _getController(): ControllerHash;
  /**
   * Fires whenever the user navigates to a new route in your application
   * that matches a route.
   */
  onRoute(name: string, path: string, args: any[]): void;
}
declare class Router {
  static extend: (protoProps: ObjectHash) => any;
  constructor(options?: RouterOptions);
}
interface Router {
  // Execute a route handler with the provided parameters.  This is an
  // excellent place to do pre-route setup or post-route cleanup.
  execute(callback: Function, args: any[], name: any): false | void;
  // Simple proxy to `History` to save a fragment into the history.
  navigate(fragment: string, options?: any): Router;
  // Convert a route string into a regular expression, suitable for matching
  // against the current location hash.
  _routeToRegExp(route: string): RegExp;
  // Given a route, and a URL fragment that it matches, return the array of
  // extracted decoded parameters. Empty or unmatched parameters will be
  // treated as `null` to normalize cross-browser behavior.
  _extractParameters(route: RegExp, fragment: string): string[];
}
interface Router {
  route(
    route: string | RegExp,
    name: string | Function,
    callback?: Function
  ): Router;
  // Bind all defined routes to `Backbone.history`. We have to reverse the
  // order of the routes here to support behavior where the most general
  // routes can be defined at the bottom of the route map.
  _bindRoutes(): void;
  // Similar to route method but
  // method is called on the controller
  appRoute(route: string, methodName: string): Router;
  // process the route event and trigger the onRoute
  // method call, if it exists
  _processOnRoute(routeName: string, routeArgs: any): void;
  // Internal method to process the `appRoutes` for the
  // router, and turn them in to routes that trigger the
  // specified method on the specified `controller`.
  processAppRoutes(controller: ControllerHash, appRoutes: StringHash): Router;
  _addAppRoute(
    controller: ControllerHash,
    route: string,
    methodName: string
  ): any;
}
/*
 * Radio.Requests
 * -----------------------
 * A messaging system for requesting data.
 */
interface Requests {
  request(requestName: string, ...args: any[]): any;
  reply(
    requestName: string,
    callback: (...args: any[]) => any,
    context?: any
  ): Requests;
  reply(
    commands: {
      [key: string]: (...args: any[]) => any;
    },
    context?: any
  ): Requests;
  replyOnce(
    requestName: string,
    callback: (...args: any[]) => any,
    context?: any
  ): Requests;
  replyOnce(
    commands: {
      [key: string]: (...args: any[]) => any;
    },
    context?: any
  ): Requests;
  stopReplying(
    commandName?: string,
    callback?: (...args: any[]) => any,
    context?: any
  ): Requests;
}
interface Radio {
  // Whether or not we're in DEBUG mode or not. DEBUG mode helps you
  // get around the issues of lack of warnings when events are mis-typed.
  DEBUG: boolean;
  // Format debug text.
  _debugText(warning: string, eventName: string, channelName?: string): string;
  // This is the method that's called when an unregistered event was called.
  // By default, it logs warning to the console. By overriding this you could
  // make it throw an Error, for instance. This would make firing a nonexistent event
  // have the same consequence as firing a nonexistent method on an Object.
  debugLog(warning: string, eventName: string, channelName?: string): void;
  Requests: Requests;
  // An internal method used to handle Radio's method overloading for Requests.
  // It's borrowed from Events. It differs from Backbone's overload
  // API (which is used in Backbone.Events) in that it doesn't support space-separated
  // event names.
  _eventsApi(obj: any, action: any, name: any, rest?: any): any;
  // An optimized way to execute callbacks.
  _callHandler(callback: any, context: any, args: any): any;
  // Log information about the channel and event
  log(channelName: any, eventName: any): string | void;
  // Logs all events on this channel to the console. It sets an
  // internal value on the channel telling it we're listening,
  // then sets a listener on the Events
  tuneIn(channelName: any): Radio;
  // Stop logging all of the activities on this channel to the console
  tuneOut(channelName: any): Radio;
}
declare const Radio: Radio;
interface Radio {
  _channels: {
    [key: string]: Channel;
  };
  // Get a reference to a channel by name.
  channel(channelName: string): Channel;
}
declare const Requests: Requests;
interface Channel extends EventMixin, Requests {
  channelName: string;
  // Remove all handlers from the messaging systems of this channel
  reset(): Channel;
  _tunedIn: boolean;
  _requests: any;
  _events: any;
}
declare class Channel {
  // A Channel is an object that extends from Backbone.Events,
  // and Radio.Requests.
  constructor(channelName: string);
}
/*
 * Top-level API
 * -------------
 * Supplies the 'top-level API' for working with Channels directly from Radio.
 */
interface Radio extends EventMixin, Requests {
  reset(channelName?: string): any;
}
declare const getOption: typeof getOptions;
type _bindRequests = (channel: Channel, bindings: ObjectHash) => any;
declare const _bindRequests: _bindRequests;
type _unbindRequests = (channel: Channel, bindings: ObjectHash) => any;
declare const _unbindRequests: _unbindRequests;
/**
 * -------------
 * CommonMixin
 * used by the following Marionette objects:
 * * View & CollectionView (through BaseViewMixin)
 * * Application
 * * Manager
 * * Behavior
 * * Region
 * * Radio
 * -------------
 * Provides :
 * * normalizeMethod
 * * methods to get/set/merge options
 * * bind/unbind events & requests with Radio
 * * triggerMethod
 */
interface CommonMixin extends EventMixin {
  normalizeMethods: normalizeMethods;
  _setOptions: _setOptions;
  mergeOptions: mergeOptions;
  getOption: getOption;
  bindEvents: typeof _bindEvents;
  unbindEvents: typeof _unbindEvents;
  triggerMethod: triggerMethod;
  bindRequests: _bindRequests;
  unbindRequests: _unbindRequests;
}
declare const CommonMixin: CommonMixin;
/**
 * DestroyMixin
 * --------------
 * Used by Application & Manager
 */
interface DestroyMixin {
  _isDestroyed: boolean;
  isDestroyed(): boolean;
  destroy(options?: ObjectHash): any;
}
declare const DestroyMixin: DestroyMixin;
// MixinOptions
// - channelName
// - radioEvents
// - radioRequests
interface RadioMixin {
  _channel?: Channel;
  _initRadio(): void;
  _destroyRadio(): void;
  getChannel(): Channel;
}
declare const RadioMixin: RadioMixin;
interface Manager extends CommonMixin, DestroyMixin, RadioMixin {
  extend(protoProps?: ObjectHash): Manager;
  cidPrefix: string;
  cid: string;
  initialize(): void;
}
// Manager borrows many conventions and utilities from Marionette.
declare class Manager {
  static extend: (this: typeof Manager, protoProps: ObjectHash) => any;
  constructor(options?: object);
}
// MixinOptions
// - collectionEvents
// - modelEvents
interface DelegateEntityEventsMixin {
  _delegateEntityEvents(model?: any, collection?: any): void;
  _undelegateEntityEvents(model?: any, collection?: any): void;
  _deleteEntityEventHandlers(): void;
}
declare const DelegateEntityEventsMixin: DelegateEntityEventsMixin;
interface TriggersMixin {
  _getViewTriggers(
    view: any,
    triggers: {
      [index: string]: string;
    }
  ): void;
}
declare const TriggersMixin: TriggersMixin;
declare global {
  interface UIHash {
    [key: string]: $Dom;
  }
}
interface UIMixin {
  ui?: StringHash | UIHash;
  _ui?: UIHash;
  _uiBindings?: StringHash | UIHash;
  // normalize the keys of passed hash with the views `ui` selectors.
  // `{"@ui.foo": "bar"}`
  normalizeUIKeys(hash: any, property?: any): {};
  // `"@ui.bar"`
  normalizeUIString(uiString: string): any;
  // normalize the values of passed hash with the views `ui` selectors.
  // `{foo: "@ui.bar"}`
  normalizeUIValues(hash: ObjectHash, property: string): StringHash;
  _getUIBindings(): StringHash;
  // This method binds the elements specified in the "ui" hash inside the view's code with
  // the associated $dom selectors.
  _bindUIElements(): void;
  _unbindUIElements(): void;
  _getUI(names: string): $Dom;
}
declare const UIMixin: UIMixin;
interface Behavior
  extends CommonMixin,
    DelegateEntityEventsMixin,
    TriggersMixin,
    UIMixin,
    EventMixin {
  cidPrefix: string;
  view: View<Model>;
  cid: string;
  initialize(): void;
  $el: $Dom;
  el: Element;
  options?: any;
  events: EventMap;
  triggers: EventMap;
}
declare class Behavior {
  static classOptions: string[];
  static extend: (this: typeof Behavior, protoProps: ObjectHash) => any;
  constructor(options: ObjectHash, view: View<Model>);
}
interface Behavior {
  // proxy behavior $ method to the view
  // this is useful for doing jquery DOM lookups
  // scoped to behaviors view.
  $(): $Dom;
}
interface Behavior {
  // Stops the behavior from listening to events.
  destroy(): Behavior;
}
interface Behavior {
  proxyViewProperties(): Behavior;
}
interface Behavior {
  bindUIElements(): Behavior;
  unbindUIElements(): Behavior;
  getUI(name: string): $Dom;
}
interface Behavior {
  // Handle `modelEvents`, and `collectionEvents` configuration
  delegateEntityEvents(): Behavior;
  undelegateEntityEvents(): Behavior;
  _getEvents(): EventMap | void;
  // Internal method to build all trigger handlers for a given behavior
  _getTriggers(): EventMap | void;
}
// MixinOptions
// - behaviors
interface BehaviorsMixin {
  // _behaviors: Behavior[];
  _initBehaviors(): void;
  _getBehaviorTriggers(): any; // TODO: precise the result
  _getBehaviorEvents(): any; // TODO: precise the result
  _proxyBehaviorViewProperties(): void;
  _delegateBehaviorEntityEvents(): void;
  _undelegateBehaviorEntityEvents(): void;
  _destroyBehaviors(options: ObjectHash): void;
  _removeBehavior(behavior: any): void; // TODO: precise behavior parameter to type: Behavior
  _bindBehaviorUIElements(): void;
  _unbindBehaviorUIElements(): void;
  _triggerEventOnBehaviors(
    eventName: string,
    view: any,
    options: ObjectHash
  ): void; // TODO: precise view parameter to type: View
}
declare const BehaviorsMixin: BehaviorsMixin;
// const patch = init([
//   attributesModule,
//   eventListenersModule,
//   classModule,
//   propsModule,
//   styleModule,
//   datasetModule
// ]);
// MixinOptions
// - template
// - templateContext
interface TemplateRenderMixin {
  outRender: boolean;
  template?: any;
  elTree: boolean | VDom.VNode;
  _renderTemplate(template: any): void; // TODO: precise type of template arg
  getTemplate(): any; // TODO: precise type of return
  mixinTemplateContext(serializeData: any): any;
  serializeModel(): ObjectHash;
  serializeData(): any;
  serializeCollection(): any;
  _renderHtml(template: any, data: any): any;
  attachElContent(html: string): void;
}
declare const TemplateRenderMixin: TemplateRenderMixin;
interface ElementMixin {
  el?: HTMLElement;
  $el?: $Dom;
  $: typeof $Dom.prototype.init;
  className?: string;
  tagName: string;
  id?: string;
  // Ensure that the View has a DOM element to render into.
  // If `this.el` is a string, pass it through `$()`, take the first
  // matching element, and re-assign it to `el`. Otherwise, create
  // an element from the `id`, `className` and `tagName` properties.
  _ensureElement(): void;
  // Handle destroying the view and its children.
  destroy(options?: any): any;
  // Equates to this.$el.remove
  _removeElement(): void;
}
declare const ElementMixin: ElementMixin;
declare global {
  interface BaseViewRegionInterface {
    regions: {} | ObjectHash;
    _regions: {} | ObjectHash;
  }
}
// ViewMixinOptions
// - behaviors
// - childViewEventPrefix
// - childViewEvents
// - childViewTriggers
// - collectionEvents
// - modelEvents
// - triggers
// - ui
interface BaseViewMixinOptions {
  // Behavior objects to assign to this View.
  behaviors?: Behavior[];
  // Customize the event prefix for events that are forwarded through the
  // collection view.
  childViewEventPrefix?: string | false;
  //  Use the childViewEvents attribute to map child events to methods on the
  //  parent view.
  childViewEvents?: EventMap;
  // A childViewTriggers hash or method permits proxying of child view events
  // without manually setting bindings. The values of the hash should be a
  // string of the event to trigger on the parent.
  childViewTriggers?: EventMap;
  // Bind to events that occur on attached collections.
  collectionEvents?: EventMap;
  // Bind to events that occur on attached models.
  modelEvents?: EventMap;
  // The view triggers attribute binds DOM events to Marionette View events
  // that can be responded to at the view or parent level.
  triggers?: EventMap;
  // Name parts of your template to be used
  // throughout the view with the ui attribute.
  ui?: StringHash;
}
interface BaseViewMixin
  extends EventMixin,
    BehaviorsMixin,
    CommonMixin,
    DelegateEntityEventsMixin,
    TemplateRenderMixin,
    TriggersMixin,
    UIMixin,
    ElementMixin {
  Dom: typeof VDom.DomApi;
  supportsRenderLifecycle: boolean;
  supportsDestroyLifecycle: boolean;
  _isDestroyed: boolean;
  isDestroyed(): boolean;
  _isRendered: boolean;
  isRendered(): boolean;
  _isAttached: boolean;
  isAttached(): boolean;
  monitorViewEvents: boolean;
  _areViewEventsMonitored: boolean;
  _disableDetachEvents: boolean;
  _childViewEvents: ObjectHash;
  _childViewTriggers: ObjectHash;
  _eventPrefix: string | boolean;
  // el: Element;
  // $el: $Dom;
  // className?: string;
  // tagName: string;
  // id?: string;
  // Ensure that the View has a DOM element to render into.
  // If `this.el` is a string, pass it through `$()`, take the first
  // matching element, and re-assign it to `el`. Otherwise, create
  // an element from the `id`, `className` and `tagName` properties.
  _ensureElement(): void;
  // A finer-grained `undelegateEvents` for removing a single delegated event.
  // `selector` and `listener` are both optional.
  undelegateEvents(): void;
  undelegate(eventName: string, selector?: string, listener?: any): any;
  // Add a single event listener to the view's element (or a child element
  // using `selector`). This only works for delegate-able events: not `focus`,
  // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
  delegate(eventName: string, selector: string, listener: any): BaseView;
  // set `events` and `triggers` to internal _delegateEvents()
  delegateEvents(events?: any): any;
  _delegateEvents(events: any): any;
  // Allows View events to utilize `@ui.` selectors
  _getEvents(events: any): EventMap;
  // Configure `triggers` to forward DOM events to view
  // events. `triggers: {"click .foo": "do:foo"}`
  _getTriggers(): EventMap;
  // Handle `modelEvents`, and `collectionEvents` configuration
  delegateEntityEvents(): void;
  // Handle unbinding `modelEvents`, and `collectionEvents` configuration
  undelegateEntityEvents(): void;
  // Remove this view by taking the element out of the DOM, and removing any
  // applicable Backbone.Events listeners.
  remove(): void;
  // This method binds the elements specified in the "ui" hash
  bindUIElements(): any;
  // This method unbinds the elements specified in the "ui" hash
  unbindUIElements(): any;
  getUI(name: string): $Dom;
  _buildEventProxies(): void;
  _getEventPrefix(): boolean | string;
  _proxyChildViewEvents(view: GenericView): void;
  _childViewEventHandler(eventName: string, ...args: any[]): void;
  _behaviors: Behavior[];
}
declare const BaseViewMixin: BaseViewMixin;
interface RegionRemoveViewMixin {
  // Override this method to determine what happens when the view
  // is removed from the region when the view is not being detached
  removeView(view: GenericView): void;
  // Non-Marionette safe view.destroy
  destroyView(view: GenericView): GenericView;
  // If the regions parent view is not monitoring its attach/detach events
  _shouldDisableMonitoring(): boolean;
}
declare const RegionRemoveViewMixin: RegionRemoveViewMixin;
interface RegionDestroyMixin {
  _isDestroyed: boolean;
  isDestroyed(): boolean;
  // Destroy the region, remove any child view
  // and remove the region from any associated view
  destroy(options?: ObjectHash): Region;
  // Reset the region by destroying any existing view and clearing out the cached `$el`.
  // The next time a view is shown via this region, the region will re-query the DOM for
  // the region's `el`.
  reset(options?: ObjectHash): Region;
}
declare const RegionDestroyMixin: RegionDestroyMixin;
interface RegionDetachViewMixin {
  // Empties the Region without destroying the view
  // Returns the detached view
  detachView(): GenericView;
  _detachView(view: GenericView): void;
  // Destroy the current view, if there is one. If there is no current view,
  // it will detach any html inside the region's `el`.
  empty(options?: ObjectHash): Region;
  _empty(view: GenericView, shouldDestroy?: boolean): void;
  // Override this method to change how the region detaches current content
  detachHtml(): void;
  _stopChildViewEvents(view: GenericView): void;
}
declare const RegionDetachViewMixin: RegionDetachViewMixin;
interface RegionShowViewMixin {
  // Displays a view instance inside of the region. If necessary handles calling the `render`
  // method for you. Reads content directly from the `el` attribute.
  show(view: GenericView, options?: ObjectHash): Region;
  _getView(view: GenericView, options?: any): GenericView;
  // This allows for a template or a static string to be
  // used as a template
  _getViewOptions(viewOptions: any): any;
  _setupChildView(view: GenericView): void;
  _proxyChildViewEvents(view: GenericView): void;
  _attachView(view: GenericView, options?: ObjectHash): void;
  // Override this method to change how the new view is appended to the `$el` that the
  // region is managing
  attachHtml(view: GenericView): void;
  // Checks whether a view is currently present within the region. Returns `true` if there is
  // and `false` if no view is present.
  hasView(): boolean;
}
declare const RegionShowViewMixin: RegionShowViewMixin;
interface RegionElementMixin {
  // Override this method to change how the region finds the DOM element that it manages. Return
  // a $dom selector object scoped to a provided parent el or the document if none exists.
  getEl(el: Element): any;
  _ensureElement(options?: ObjectHash): boolean;
  // always restore the el to ensure the regions el is present before replacing
  _replaceEl(view: GenericView): void;
  // Restore the region's element in the DOM.
  _restoreEl(): void;
}
declare const RegionElementMixin: RegionElementMixin;
// Static setter for the renderer
type tSetRenderer = (renderer: any) => any;
interface Region
  extends CommonMixin,
    RegionRemoveViewMixin,
    RegionDestroyMixin,
    RegionDetachViewMixin,
    RegionShowViewMixin,
    RegionElementMixin {
  extend(properties: any, classProperties?: any): any;
  setDomApi: VDom.tSetDomApi;
  setRenderer: tSetRenderer;
  Dom: typeof VDom.DomApi;
  cidPrefix: string;
  cid: string;
  replaceElement: boolean;
  allowMissingEl: boolean;
  parentEl: any; // TODO must precise this
  _isReplaced: boolean;
  _isSwappingView: boolean;
  el: Element;
  $el: $Dom;
  _initEl: Element;
  currentView: GenericView;
  _parentView?: GenericView;
  _name: string;
  // This is a noop method intended to be overridden
  initialize(): void;
}
declare class Region {
  static classOptions: string[];
  static extend: (this: typeof Region, protoProps: ObjectHash) => any;
  static setDomApi: VDom.tSetDomApi;
  static setRenderer: tSetRenderer;
  constructor(options?: ObjectHash);
}
interface Region {
  // Check to see if the region's el was replaced.
  isReplaced(): boolean;
  // Check to see if a view is being swapped by another
  isSwappingView(): boolean;
}
/**
 * ViewRegionMixin
 * ----------------
 */
// MixinOptions
// - regions
// - regionClass
type regionObject = {
  [key: string]:
    | string
    | {
        el: string;
        replaceElement?: boolean;
        regionClass?: Region;
      };
};
type regionsDefinitions = regionObject | (() => regionObject);
interface ViewRegionMixin extends BaseViewRegionInterface {
  regionClass: typeof Region;
  regions: {} | ObjectHash;
  _regions: {} | ObjectHash;
  // Internal method to initialize the regions that have been defined in a
  // `regions` attribute on this View.
  _initRegions(): void;
  // Internal method to re-initialize all of the regions by updating
  // the `el` that they point to
  _reInitRegions(): void;
  // Add a single region, by name, to the View
  addRegion(name: string, definition: any): Region;
  // Add multiple regions as a {name: definition, name2: def2} object literal
  addRegions(regions: regionsDefinitions): {
    [key: string]: Region;
  };
  // internal method to build and add regions
  _addRegions(regionDefinitions: regionsDefinitions): {
    [key: string]: Region;
  };
  _addRegion(region: Region, name: string): void;
  // Remove a single region from the View, by name
  removeRegion(name: string): Region;
  // Remove all regions from the View
  removeRegions(): void;
  _removeRegion(region: Region, name: string): void;
  // Called in a region's destroy
  _removeReferences(name: string): void;
  // Empty all regions in the region manager, but
  // leave them attached
  emptyRegions(): {
    [key: string]: Region;
  };
  // Checks to see if view contains region
  // Accepts the region name
  // hasRegion("main")
  hasRegion(name: string): void;
  // Provides access to regions
  // Accepts the region name
  // getRegion("main")
  getRegion(name: string): Region;
  _getRegions(): {
    [key: string]: Region;
  };
  // Get all regions
  getRegions(): {
    [key: string]: Region;
  };
  showChildView(name: string, view: BaseView, options?: ObjectHash): BaseView;
  detachChildView(name: string): GenericView;
  getChildView(name: string): GenericView;
}
declare const ViewRegionMixin: ViewRegionMixin;
interface ViewElementMixin {
  // Change the view's element (`this.el` property) and re-delegate the
  // view's events on the new element.
  setElement(element: any): GenericView;
  // Creates the `this.el` and `this.$el` references for this view using the
  // given `el`. `el` can be a CSS selector or an HTML string, a $Dom
  // context or an element. Subclasses can override this to utilize an
  // alternative DOM manipulation API and are only required to set the
  // `this.el` property.
  _setElement(el: any): void;
  // Remove this view's element from the document and all event listeners
  // attached to it. Exposed for subclasses using an alternative DOM
  // manipulation API.
  _removeElement(): void;
  // Produces a DOM element to be assigned to your view. Exposed for
  // subclasses using an alternative DOM manipulation API.
  _createElement(tagName: string): Element;
}
declare const ViewElementMixin: ViewElementMixin;
interface ViewRenderMixin {
  // If a template is available, renders it into the view's `el`
  // Re-inits regions and binds UI.
  render(): BaseView;
}
declare const ViewRenderMixin: ViewRenderMixin;
// ViewOptions used with new View(options?: ViewOptions)
interface ViewOptions<TModel extends Model> extends BaseViewMixinOptions {
  model?: TModel;
  // TODO: quickfix, this can't be fixed easy. The collection does not need to have the same model as the parent view.
  collection?: Collection<any>; //was: Collection<TModel>;
  el?: any;
  events?: EventMap;
  id?: string;
  className?: string;
  tagName?: string;
  attributes?: {
    [id: string]: any;
  };
  // If you've created a custom region class, you can use it to define
  // your region.
  regionClass?: any;
  // Add regions to this View.
  regions?: any;
  // Set the template of this View.
  template?: any;
  // The templateContext attribute can be used to add extra information to
  // your templates
  templateContext?: any;
}
interface View<TModel extends Model>
  extends EventMixin,
    BaseViewMixin,
    ViewRegionMixin,
    ViewElementMixin,
    ViewRenderMixin {
  extend: any;
  setDomApi: VDom.tSetDomApi;
  setRenderer: tSetRenderer;
  Dom: typeof VDom.DomApi;
  cid: string;
  tagName: string;
  initialize(): void;
  _setAttributes(attributes: StringHash): void;
  // called by ViewMixin destroy
  _removeChildren(): void;
  events: StringHash;
  triggers: StringHash;
  regions: {} | ObjectHash;
  _regions: {} | ObjectHash;
  model?: Model;
  collection?: Collection<Model>;
}
declare class View<TModel extends Model> {
  static classProperties: string[];
  static classOptions: string[];
  static extend: (this: typeof View, protoProps: ObjectHash) => any;
  static setDomApi: VDom.tSetDomApi;
  static setRenderer: tSetRenderer;
  constructor(options?: ViewOptions<TModel>);
}
interface CollectionViewGetChildViewMixin {
  // Retrieve the `childView` class
  // The `childView` property can be either a view class or a function that
  // returns a view class. If it is a function, it will receive the model that
  // will be passed to the view instance (created from the returned view class)
  _getChildView(child: Model): typeof View; // | ((model: Model) => typeof View);
  // First check if the `view` is a view class (the common case)
  // Then check if it's a function (which we assume that returns a view class)
  _getView(
    view: typeof View | ((model: Model) => typeof View),
    child?: Model
  ): typeof View;
  _getChildViewOptions(child: Model): ObjectHash;
}
declare const CollectionViewGetChildViewMixin: CollectionViewGetChildViewMixin;
interface CollectionViewFilterMixin {
  // This method filters the children views and renders the results
  filter(): BaseCollectionView;
  _filterChildren(): void;
  // This method returns a function for the viewFilter
  _getFilter(): ((...args: []) => any) | false;
  // Override this function to provide custom
  // viewFilter logic
  getFilter():
    | string
    | ObjectHash
    | ((view: View<Model>, index?: number, children?: View<Model>[]) => any)
    | any;
  // Sets the view's `viewFilter` and applies the filter if the view is ready.
  // To prevent the render pass `{ preventRender: true }` as the 2nd argument.
  setFilter(
    filter:
      | string
      | ObjectHash
      | ((view: View<Model>, index?: number, children?: View<Model>[]) => any),
    options?: {
      preventRender: boolean;
    }
  ): BaseCollectionView;
  // Clears the `viewFilter` and follows the same rules for rendering as `setFilter`.
  removeFilter(options?: { preventRender: boolean }): void;
}
declare const CollectionViewFilterMixin: CollectionViewFilterMixin;
interface CollectionViewEmptyViewMixin {
  _emptyRegion?: Region;
  getEmptyRegion(): Region;
  // Specify a view to use if the collection has no children.
  emptyView?: (() => typeof View) | typeof View;
  // Define options to pass to the emptyView constructor.
  emptyViewOptions?: (() => ViewOptions<Model>) | ViewOptions<Model>;
  isEmpty(): boolean;
  _showEmptyView(): void;
  // Retrieve the empty view class
  _getEmptyView(): typeof View;
  // Remove the emptyView
  _destroyEmptyView(): void;
  _getEmptyViewOptions(): ObjectHash;
}
declare const CollectionViewEmptyViewMixin: CollectionViewEmptyViewMixin;
interface CollectionViewCollectionEventsMixin {
  // Configured the initial events that the collection view binds to.
  _initialEvents(): void;
  // Internal method. This checks for any changes in the order of the collection.
  // If the index of any view doesn't match, it will re-sort.
  _onCollectionSort(
    collection: Collection<Model>,
    args?: {
      add?: any;
      merge?: any;
      remove?: any;
    }
  ): void;
  _onCollectionReset(): void;
  // Handle collection update model additions and removals
  _onCollectionUpdate(collection: Collection<Model>, options: any): void;
}
declare const CollectionViewCollectionEventsMixin: CollectionViewCollectionEventsMixin;
interface CollectionViewSortMixin {
  // flag for maintaining the sorted order of the collection
  sortWithCollection: boolean;
  // Sorts the children then filters and renders the results.
  sort(): BaseCollectionView;
  // Sorts views by viewComparator and sets the children to the new order
  _sortChildren(): void;
  // Sets the view's `viewComparator` and applies the sort if the view is ready.
  // To prevent the render pass `{ preventRender: true }` as the 2nd argument.
  setComparator(
    comparator: string | false,
    options?: {
      preventRender: boolean;
    }
  ): BaseCollectionView;
  // Clears the `viewComparator` and follows the same rules for rendering as `setComparator`.
  removeComparator(options?: { preventRender: boolean }): BaseCollectionView;
  // If viewComparator is overriden it will be returned here.
  // Additionally override this function to provide custom
  // viewComparator logic
  getComparator(): string | false | ((...args: any[]) => number);
  // Default internal view comparator that order the views by
  // the order of the collection
  _viewComparator(view: BaseView): number;
}
declare const CollectionViewSortMixin: CollectionViewSortMixin;
interface CollectionViewDetachChildViewsMixin {
  _detachChildren(detachingViews: View<Model>[]): void;
  _detachChildView(view: View<Model>): void;
  // Override this method to change how the collectionView detaches a child view
  detachHtml(view: View<Model>): void;
}
declare const CollectionViewDetachChildViewsMixin: CollectionViewDetachChildViewsMixin;
interface CollectionViewRenderChildViewsMixin {
  _renderChildren(): void;
  // Renders each view and creates a fragment buffer from them
  _getBuffer(views: View<Model>[]): Element | DocumentFragment;
  _attachChildren(els: DocumentFragment | Element, views: View<Model>[]): void; // TODO els ???
  // Override this method to do something other than `.append`.
  // You can attach any HTML at this point including the els.
  attachHtml(els: Element | DocumentFragment, $container: $Dom): void;
}
declare const CollectionViewRenderChildViewsMixin: CollectionViewRenderChildViewsMixin;
interface CollectionViewAddChildViewsMixin {
  // Added views are returned for consistency with _removeChildModels
  _addChildModels(models: Model[]): View<Model>[];
  _addChildModel(model: Model): View<Model>;
  _createChildView(model: Model): View<Model>;
  // Render the child's view and add it to the HTML for the collection view at a given index, based on the current sort
  addChildView(view: View<Model>, index?: number): any;
  _addChild(view: View<Model>, index?: number): void;
}
declare const CollectionViewAddChildViewsMixin: CollectionViewAddChildViewsMixin;
// Provide a container to store, retrieve and
// shut down child views.
interface ChildViewContainer {
  length: number;
  // Initializes an empty container
  _init(): void;
  _views: View<Model>[];
  _viewsByCid: {
    [key: string]: View<Model>;
  };
  _indexByModel: object;
  _updateLength(): void;
}
declare class ChildViewContainer {
  constructor();
}
interface ChildViewContainer {
  // Add a view to this container. Stores the view
  // by `cid` and makes it searchable by the model
  // cid (and model itself). Additionally it stores
  // the view by index in the _views array
  _add(view: View<Model>, index?: number): void;
}
interface ChildViewContainer {
  _addViewIndexes(view: View<Model>): void;
}
interface ChildViewContainer {
  // Sort (mutate) and return the array of the child views.
  _sort(comparator: string | Function, context: any): View<Model>[];
  // Makes `_.sortBy` mutate the array to match `this._views.sort`
  _sortBy(comparator: any): View<Model>[];
}
interface ChildViewContainer {
  // Replace array contents without overwriting the reference.
  // Should not add/remove views
  _set(views: View<Model>[], shouldReset?: boolean): void;
}
interface ChildViewContainer {
  // Swap views by index
  _swap(view1: View<Model>, view2: View<Model>): void;
}
interface ChildViewContainer {
  // Find a view by the model that was attached to it.
  // Uses the model's `cid` to find it.
  findByModel(model: Model): View<Model>;
  // Find a view by the `cid` of the model that was attached to it.
  findByModelCid(modelCid: string): View<Model>;
  // Find a view by index.
  findByIndex(index: number): View<Model>;
  // Find the index of a view instance
  findIndexByView(view: View<Model>): number;
  // Retrieve a view by its `cid` directly
  findByCid(cid: string): View<Model>;
}
interface ChildViewContainer {
  hasView(view: View<Model>): boolean;
}
interface ChildViewContainer {
  // Remove a view and clean up index references.
  _remove(view: View<Model>): void;
}
interface ChildViewContainer {
  _updateLength(): void;
}
interface ChildViewContainer {
  forEach(iterator: ListIterator<View<Model>, void>, context?: any): void;
  map<TResult>(
    iterator: ListIterator<View<Model>, TResult>,
    context?: any
  ): TResult[];
  find(predicate: CollectionPredicate): View<Model>;
  filter(predicate: CollectionPredicate): View<Model>[];
  // test if all views pass the test implemented by the provided predicate.
  every(predicate: CollectionPredicate): boolean;
  some(predicate: CollectionPredicate, context?: any): boolean;
  contains(view: View<Model>): boolean;
  isEmpty(): boolean;
  pluck(attribute: string): View<Model>[];
}
/**
 * CollectionViewChildContainerMixin
 * --
 * * setup the `children` and `_children` property
 * * get the children views and `childViewContainer`
 */
interface CollectionViewChildContainerMixin {
  children?: ChildViewContainer;
  _children?: ChildViewContainer;
  // Internal method to set up the `children` object for storing all of the child views
  // `_children` represents all child views
  // `children` represents only views filtered to be shown
  _initChildViewStorage(): void;
  // used by ViewMixin's `_childViewEventHandler`
  _getImmediateChildren(): View<Model>[];
  // Get a container within the template to add the children within
  _getChildViewContainer(): void;
}
declare const CollectionViewChildContainerMixin: CollectionViewChildContainerMixin;
interface CollectionViewRemoveChildViewsMixin {
  swapChildViews(view1: View<Model>, view2: View<Model>): void;
  // Detach a view from the children.  Best used when adding a
  // childView from `addChildView`
  detachChildView(view: View<Model>): View<Model>;
  // Remove the child view and destroy it.  Best used when adding a
  // childView from `addChildView`
  // The options argument is for internal use only
  removeChildView(
    view: View<Model>,
    options?: {
      shouldDetach: boolean;
    }
  ): View<Model>;
  _removeChildViews(views: View<Model>[]): void;
  _removeChildView(
    view: View<Model>,
    options?: {
      shouldDetach: boolean;
    }
  ): void;
  _destroyChildView(view: View<Model>): void;
  // called by ViewMixin destroy
  _removeChildren(): void;
  // Destroy the child views that this collection view is holding on to, if any
  _destroyChildren(): void;
  _removeChildModels(models: Model[]): View<Model>[];
  _removeChildModel(model: Model): View<Model>;
  _removeChild(View: View<Model>): void;
}
declare const CollectionViewRemoveChildViewsMixin: CollectionViewRemoveChildViewsMixin;
interface CollectionViewOptions<
  TModel extends Model,
  TCollection extends Collection<TModel>
> extends ViewOptions<TModel>,
    BaseViewMixinOptions {
  // Specify a child view to use.
  childView?: ((model: TModel) => typeof View) | typeof View;
  // Define options to pass to the childView constructor.
  childViewOptions?:
    | ((...args: any[]) => ViewOptions<TModel>)
    | ViewOptions<TModel>;
  // The events attribute binds DOM events to actions to perform on the
  // view. It takes DOM event key and a mapping to the handler.
  events?: EventMap;
  // Prevent some of the underlying collection's models from being
  // rendered as child views.
  filter?(child?: TModel, index?: number, collection?: TCollection): boolean;
  // Specify a view to use if the collection has no children.
  emptyView?: (() => typeof View) | typeof View;
  // Define options to pass to the emptyView constructor.
  emptyViewOptions?: (() => ViewOptions<TModel>) | ViewOptions<TModel>;
  // If true when you sort your collection there will be no re-rendering,
  // only the DOM nodes will be reordered.
  reorderOnSort?: boolean;
  // If false the collection view will not maintain a sorted collection's
  // order in the DOM.
  sort?: boolean;
  // Render your collection view's children with a different sort order
  // than the underlying Backbone collection.
  viewComparator?:
    | string
    | ((element: TModel) => number | string)
    | ((compare: TModel, to?: TModel) => number); // Mirrors Collection.comparator
}
interface CollectionView<
  TModel extends Model,
  TView extends View<TModel>,
  TCollection extends Collection<TModel>
> extends BaseViewMixin,
    BaseViewRegionInterface,
    CollectionViewGetChildViewMixin,
    CollectionViewFilterMixin,
    CollectionViewEmptyViewMixin,
    CollectionViewCollectionEventsMixin,
    CollectionViewSortMixin,
    CollectionViewDetachChildViewsMixin,
    CollectionViewRenderChildViewsMixin,
    CollectionViewAddChildViewsMixin,
    CollectionViewChildContainerMixin,
    CollectionViewRemoveChildViewsMixin {
  extend: any;
  setDomApi: VDom.tSetDomApi;
  setRenderer: tSetRenderer;
  Dom: typeof VDom.DomApi;
  cid: string;
  tagName: string;
  initialize(): void;
  // Specify a child view to use.
  childView?: ((model: TModel) => typeof View) | typeof View;
  // Define options to pass to the childView constructor.
  childViewOptions?:
    | ((...args: any[]) => ViewOptions<TModel>)
    | ViewOptions<TModel>;
  events?: EventMap;
  triggers: EventMap;
  model?: Model;
  collection?: Collection<Model>;
  _addedViews: View<TModel>[];
  // Called in a region's destroy
  _removeReferences(name: string): void;
  $container: $Dom;
  // CollectionView allows for a custom viewComparator option if you want your CollectionView's children to be rendered
  // with a different sort order than the underlying collection uses.
  viewComparator: string | false;
  viewFilter?:
    | string
    | ObjectHash
    | ((view: View<TModel>, index?: number, children?: View<TModel>[]) => any);
}
/**
 * CollectionView
 * --------------
 */
/**
 * The CollectionView will loop through all of the models in the specified
 * collection, render each of them using a specified childView, then append
 * the results of the child view's el to the collection view's el. By
 * default the CollectionView will maintain a sorted collection's order in the
 * DOM. This behavior can be disabled by specifying {sort: false} on
 * initialize.
 */
declare class CollectionView<
  TModel extends Model,
  TView extends View<TModel>,
  TCollection extends Collection<TModel>
> {
  static classProperties: string[];
  static classOptions: string[];
  static extend: (this: typeof CollectionView, protoProps: ObjectHash) => any;
  static setDomApi: VDom.tSetDomApi;
  static setRenderer: tSetRenderer;
  constructor(options?: CollectionViewOptions<TModel, TCollection>);
}
interface CollectionView<
  TModel extends Model,
  TView extends View<TModel>,
  TCollection extends Collection<TModel>
> {
  // Build a `childView` for a model in the collection.
  // Override to customize the build
  buildChildView(
    child: Model,
    ChildViewClass: typeof View,
    childViewOptions: any
  ): any;
}
interface CollectionView<
  TModel extends Model,
  TView extends View<TModel>,
  TCollection extends Collection<TModel>
> {
  _setupChildView(view: View<Model>): void;
}
interface CollectionView<
  TModel extends Model,
  TView extends View<TModel>,
  TCollection extends Collection<TModel>
> {
  // Overriding Backbone.View's `setElement` to handle
  // if an el was previously defined. If so, the view might be
  // attached on setElement.
  setElement(
    element: Element
  ): CollectionView<Model, View<Model>, Collection<Model>>;
}
interface CollectionView<
  TModel extends Model,
  TView extends View<TModel>,
  TCollection extends Collection<TModel>
> {
  // Render children views.
  render(): CollectionView<Model, View<Model>, Collection<Model>>;
}
declare global {
  interface BaseCollectionView
    extends CollectionView<Model, View<Model>, Collection<Model>> {}
}
interface Application extends CommonMixin, DestroyMixin, RadioMixin {
  cid: string;
  cidPrefix: string;
  // This is a noop method intended to be overridden
  initialize(): void;
}
declare class Application {
  static classOptions: string[];
  static extend: (this: typeof Application, protoProps: ObjectHash) => any;
  constructor(options?: ObjectHash);
}
interface Application {
  // Kick off all of the application's processes.
  start(options?: ObjectHash): Application;
  regionClass: typeof Region;
  region: string;
  _region: Region;
  _initRegion(): void;
  getRegion(): Region;
}
interface Application {
  showView(view: GenericView, ...args: any[]): GenericView;
  getView(): GenericView;
}
declare global {
  type GenericView =
    | View<Model>
    | CollectionView<Model, View<Model>, Collection<Model>>;
  interface BaseView extends View<Model> {}
  interface BaseCollectionView
    extends CollectionView<Model, View<Model>, Collection<Model>> {}
}
// Utilities
declare const bindEvents: (context: any, ...args: any[]) => any;
declare const unbindEvents: (context: any, ...args: any[]) => any;
declare const bindRequests: (context: any, ...args: any[]) => any;
declare const unbindRequests: (context: any, ...args: any[]) => any;
declare const mergeOptions$0: (context: any, ...args: any[]) => any;
declare const getOption$0: (context: any, ...args: any[]) => any;
declare const normalizeMethods$0: (context: any, ...args: any[]) => any;
declare const triggerMethod$0: (context: any, ...args: any[]) => any;
// Configuration
declare const setDomApi: (mixin: any) => void;
declare const setRenderer$0: (renderer: any) => void;
export {
  $Dom,
  $dom,
  $DomStatic,
  _,
  EventMixin,
  Model,
  Collection,
  View,
  CollectionView,
  Region,
  Manager,
  Behavior,
  Application,
  Radio,
  Router,
  BrowserHistoryInstance as BrowserHistory,
  bindEvents,
  unbindEvents,
  bindRequests,
  unbindRequests,
  normalizeMethods$0 as normalizeMethods,
  triggerMethod$0 as triggerMethod,
  mergeOptions$0 as mergeOptions,
  getOption$0 as getOption,
  setDomApi,
  setRenderer$0 as setRenderer,
  VDom
};
