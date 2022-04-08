import { _ } from "marionext-lodash";
import { $dom, $Dom } from "marionext-dom";
import * as Snabbdom from "snabbdom";

export namespace VDom {
  const flatten = function (arr: []) {
    return Array.prototype.concat.apply([], arr);
  };
  class DomWidget {
    static widgetType = "domNodeWidget";
    constructor(node: Node) {
      this.node = node;
    }
    node: Node;
    readonly type: string = "Widget";
    init() {
      return loadScript(this.node.cloneNode(true) as Element);
    }
    update(previous, domNode: Node) {
      if (
        "domNodeWidget" === previous.constructor.widgetType &&
        domNode.nodeType === this.node.nodeType
      ) {
        switch (domNode.nodeType) {
          case 3:
            domNode.textContent = this.node.textContent;
            return domNode;
          case 1:
            (domNode as Element).outerHTML = (this.node as Element).outerHTML;
            return domNode;
        }
      }
      return this.init();
    }
  }

  function loadScript(domNode: Element) {
    if (!domNode.querySelectorAll) {
      return domNode;
    }
    if (domNode.tagName === "SCRIPT") {
      return replaceScript(domNode as HTMLScriptElement);
    }
    Array.prototype.slice
      .call(domNode.querySelectorAll("script"))
      .forEach(function (script: HTMLScriptElement) {
        var newScript = replaceScript(script);
        if (newScript !== script) {
          script.parentNode.insertBefore(newScript, script);
          script.parentNode.removeChild(script);
        }
      });
    return domNode;
  }

  function replaceScript(script: HTMLScriptElement) {
    if (script.type && "text/javascript" !== script.type) {
      return script;
    }
    const newScript = document.createElement("script");
    newScript.type = "text/javascript";
    if (script.src) {
      // Note: scripts will be loaded asynchronously (not in order)
      newScript.src = script.src;
    } else {
      newScript.textContent = script.textContent;
    }
    return newScript;
  }

  export function makeHtmlNode(html: string | Element) {
    if (!_.isString(html)) {
      return html;
    }
    const div = document.createElement("div");
    div.innerHTML = html;
    return Array.prototype.slice
      .call(div.childNodes)
      .map((child: ChildNode) => {
        return Snabbdom.toVNode(new DomWidget(child).node);
      });
  }
  export function compileAttributes(attributes, attributeBlocks) {
    var attrsObj = attributeBlocks.reduce(
      function (finalObj, currObj) {
        for (var propName in currObj) {
          finalObj[propName] = finalObj[propName]
            ? finalObj[propName].concat(currObj[propName])
            : [currObj[propName]];
        }
        return finalObj;
      },
      attributes.reduce(function (finalObj, attr) {
        var val = attr.val;
        finalObj[attr.name] = finalObj[attr.name]
          ? finalObj[attr.name].concat(val)
          : [val];
        return finalObj;
      }, {})
    );

    for (var propName in attrsObj) {
      if (propName === "class") {
        attrsObj[propName] = flatten(
          attrsObj[propName].map(function (attrValue) {
            if (
              attrValue &&
              typeof attrValue === "object" &&
              !Array.isArray(attrValue)
            ) {
              var classResult = [];
              for (var className in attrValue) {
                if (attrValue[className]) {
                  classResult.push(className);
                }
              }
              return classResult;
            }
            return attrValue;
          })
        ).join(" ");
      } else {
        attrsObj[propName] = attrsObj[propName].pop();
      }
    }

    return attrsObj;
  }
  export function text(str: string) {
    if (_.isString(str)) {
      return str.replace("&nbsp;", "\u00A0");
    }
    return str;
  }
  export const patch = Snabbdom.init([
    Snabbdom.attributesModule
    // Snabbdom.eventListenersModule,
    // Snabbdom.classModule,
    // Snabbdom.propsModule,
    // Snabbdom.styleModule,
    // Snabbdom.datasetModule
  ]);
  export const h = Snabbdom.h;
  export const vnode = Snabbdom.vnode;
  export type VNode = Snabbdom.VNode;
  export const toVNode = Snabbdom.toVNode;

  // Performant method for returning the $dom instance
  function _getEl(el: string | Element | $Dom): $Dom {
    return $dom.is$Dom(el) ? el : $dom(el);
  }

  export const DomApi = Object.assign({}, Snabbdom.htmlDomApi, {
    createBuffer(): DocumentFragment {
      return document.createDocumentFragment();
    },
    // Lookup the `selector` string
    // Selector may also be a DOM element
    // Returns an array-like object of nodes
    getEl(selector: string | Element | $Dom): $Dom {
      return _getEl(selector);
    },

    // Finds the `selector` string with the el
    // Returns an array-like object of nodes
    findEl(el: Element, selector: string, _$el: $Dom = _getEl(el)) {
      return _$el.find(selector);
    },

    // Returns true if the el contains the node childEl
    hasEl(el: Element, childEl: Element) {
      return el.contains(childEl && childEl.parentNode);
    },

    // Detach `el` from the DOM without removing listeners
    detachEl(el: Element, _$el: $Dom = _getEl(el)) {
      _$el.detach();
    },

    // Remove `oldEl` from the DOM and put `newEl` in its place
    replaceEl(newEl: Element, oldEl: Element) {
      if (newEl === oldEl) {
        return;
      }

      const parent = oldEl.parentNode;

      if (!parent) {
        return;
      }

      parent.replaceChild(newEl, oldEl);
    },

    // Swaps the location of `el1` and `el2` in the DOM
    swapEl(el1: Element, el2: Element) {
      if (el1 === el2) {
        return;
      }

      const parent1 = el1.parentNode;
      const parent2 = el2.parentNode;

      if (!parent1 || !parent2) {
        return;
      }

      const next1 = el1.nextSibling;
      const next2 = el2.nextSibling;

      parent1.insertBefore(el2, next1);
      parent2.insertBefore(el1, next2);
    },

    // Replace the contents of `el` with the HTML string of `html`
    setContents(el: Element, html: string, _$el = _getEl(el)) {
      _$el.html(html);
    },

    // Takes the DOM node `el` and appends the DOM node `contents`
    // to the end of the element's contents.
    appendContents(
      el: DocumentFragment | Element,
      contents: string | Element | DocumentFragment,
      {
        _$el = _getEl(el as Element),
        _$contents = _getEl(contents as Element)
      } = {}
    ) {
      _$el.append(_$contents);
    },

    // Does the el have child nodes
    hasContents(el: Element) {
      return !!el && el.hasChildNodes();
    },

    // Remove the inner contents of `el` from the DOM while leaving
    // `el` itself in the DOM.
    detachContents(el: Element, _$el = _getEl(el)) {
      _$el.contents().detach();
    }
  });
  // Static setter
  export type tSetDomApi = (mixin?: any) => any;
  export const setDomApi: tSetDomApi = function setDomApi(mixin?: any): any {
    this.prototype.Dom = Object.assign({}, this.prototype.Dom, mixin);
    return this;
  };
}
