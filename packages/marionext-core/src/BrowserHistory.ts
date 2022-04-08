// BrowserHistory
// ----------------

// Handles cross-browser history management, based on either
// [pushState](http://diveintohtml5.info/history.html) and real URLs, or
// [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
// and URL fragments. If the browser supports neither (old IE, natch),
// falls back to polling.
import { _ } from "marionext-lodash";
import { EventMixin } from "marionext-event";
import { _routeToRegExp } from "./Common/Common-routeToRegExp.function";

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

class BrowserHistory {
  static instance: BrowserHistory;
  static getInstance(): BrowserHistory {
    if (!BrowserHistory.instance) {
      BrowserHistory.instance = new BrowserHistory();
    }
    return BrowserHistory.instance;
  }
  // Has the history handling already been started?
  static started = false;
  private constructor() {
    this.handlers = [];
    // Ensure that `BrowserHistory` can be used outside of the browser.
    if (typeof window !== "undefined") {
      this.location = window.location;
      this.history = window.history;
    }
    this.checkUrl = this.checkUrl.bind(this);
  }
}

const BrowserHistoryProto = BrowserHistory.prototype;

BrowserHistoryProto.interval = 50;

interface BrowserHistory {
  // Are we at the app root?
  atRoot(): boolean;

  // Does the pathname match the root?
  matchRoot(): boolean;
}
BrowserHistoryProto.atRoot = function (this: BrowserHistory) {
  const path = this.location.pathname.replace(/[^\/]$/, "$&/");
  return path === this.root && !this.getSearch();
};
BrowserHistoryProto.matchRoot = function (this: BrowserHistory) {
  const path = this.decodeFragment(this.location.pathname);
  const rootPath = path.slice(0, this.root.length - 1) + "/";
  return rootPath === this.root;
};

interface BrowserHistory {
  // Unicode characters in `location.pathname` are percent encoded so they're
  // decoded for comparison. `%25` should not be decoded since it may be part
  // of an encoded parameter.
  decodeFragment(fragment: string): string;
}
BrowserHistoryProto.decodeFragment = function (this: BrowserHistory, fragment) {
  return decodeURI(fragment.replace(/%25/g, "%2525"));
};

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
BrowserHistoryProto.getSearch = function (this: BrowserHistory) {
  const match = this.location.href.replace(/#.*/, "").match(/\?.+/);
  return match ? match[0] : "";
};
BrowserHistoryProto.getHash = function (this: BrowserHistory) {
  const match = (window || this).location.href.match(/#(.*)$/);
  return match ? match[1] : "";
};
BrowserHistoryProto.getPath = function (this: BrowserHistory) {
  const path = this.decodeFragment(
    this.location.pathname + this.getSearch()
  ).slice(this.root.length - 1);
  return path.charAt(0) === "/" ? path.slice(1) : path;
};
BrowserHistoryProto.getFragment = function (this: BrowserHistory, fragment) {
  // Cached regex for stripping a leading hash/slash and trailing space.
  const routeStripper = /^[#\/]|\s+$/g;
  if (fragment == null) {
    if (this._usePushState || !this._wantsHashChange) {
      fragment = this.getPath();
    } else {
      fragment = this.getHash();
    }
  }
  return fragment.replace(routeStripper, "");
};

interface BrowserHistory {
  // Start the hash change handling, returning `true` if the current URL matches
  // an existing route, and `false` otherwise.
  start(options?: BrowserHistoryOptions): boolean;

  // Disable history, perhaps temporarily. Not useful in a real app,
  // but possibly useful for unit testing Routers.
  stop(): void;
}
BrowserHistoryProto.start = function (this: BrowserHistory, options) {
  if (BrowserHistory.started) {
    throw new Error("BrowserHistory has already been started");
  }
  BrowserHistory.started = true;

  // Cached regex for stripping leading and trailing slashes.
  const rootStripper = /^\/+|\/+$/g;

  this._hashes = this._hashes || [];
  this._checkDefaultHash();

  // Figure out the initial configuration. Do we need an iframe?
  // Is pushState desired ... is it available?
  this.options = Object.assign({ root: "/" }, this.options, options);

  this.root = this.options.root;
  this._wantsHashChange = this.options.hashChange !== false;
  this._hasHashChange =
    "onhashchange" in window &&
    (document["documentMode"] === void 0 || document["documentMode"] > 7);
  this._useHashChange = this._wantsHashChange && this._hasHashChange;
  this._wantsPushState = !!this.options.pushState;
  this._hasPushState = !!(this.history && this.history.pushState);
  this._usePushState = this._wantsPushState && this._hasPushState;
  this.fragment = this.getFragment();

  // Normalize root to always include a leading and trailing slash.
  this.root = ("/" + this.root + "/").replace(rootStripper, "/");

  // Transition from hashChange to pushState or vice versa if both are
  // requested.
  if (this._wantsHashChange && this._wantsPushState) {
    // If we've started off with a route from a `pushState`-enabled
    // browser, but we're currently in a browser that doesn't support it...
    if (!this._hasPushState && !this.atRoot()) {
      var rootPath = this.root.slice(0, -1) || "/";
      this.location.replace(rootPath + "#" + this.getPath());
      // Return immediately as browser will do redirect to new url
      return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
    } else if (this._hasPushState && this.atRoot()) {
      this.navigate(this.getHash(), { replace: true });
    }
  }

  // Proxy an iframe to handle location events if the browser doesn't
  // support the `hashchange` event, HTML5 history, or the user wants
  // `hashChange` but not `pushState`.
  if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
    this.iframe = document.createElement("iframe");
    this.iframe.src = "javascript:0";
    this.iframe.style.display = "none";
    this.iframe.tabIndex = -1;
    var body = document.body;
    // Using `appendChild` will throw on IE < 9 if the document is not ready.
    var iWindow = body.insertBefore(this.iframe, body.firstChild).contentWindow;
    iWindow.document.open();
    iWindow.document.close();
    iWindow.location.hash = "#" + this.fragment;
  }

  const addEventListener = window.addEventListener;

  // Depending on whether we're using pushState or hashes, and whether
  // 'onhashchange' is supported, determine how we check the URL state.
  if (this._usePushState) {
    addEventListener("popstate", this.checkUrl, false);
  } else if (this._useHashChange && !this.iframe) {
    addEventListener("hashchange", this.checkUrl, false);
  } else if (this._wantsHashChange) {
    this._checkUrlInterval = window.setInterval(this.checkUrl, this.interval);
  }

  if (!this.options.silent) {
    return this.loadUrl();
  }
};
BrowserHistoryProto.stop = function (this: BrowserHistory) {
  const removeEventListener = window.removeEventListener;

  // Remove window listeners.
  if (this._usePushState) {
    removeEventListener("popstate", this.checkUrl, false);
  } else if (this._useHashChange && !this.iframe) {
    removeEventListener("hashchange", this.checkUrl, false);
  }

  // Clean up the iframe if necessary.
  if (this.iframe) {
    document.body.removeChild(this.iframe);
    this.iframe = null;
  }

  // Some environments will throw when clearing an undefined interval.
  if (this._checkUrlInterval) {
    window.clearInterval(this._checkUrlInterval);
  }
  BrowserHistory.started = false;
};

interface BrowserHistory {
  // Add a route to be tested when the fragment changes. Routes added later
  // may override previous routes.
  route(route: RegExp, callback: Function): void;
}
BrowserHistoryProto.route = function (this: BrowserHistory, route, callback) {
  this.handlers.unshift({ route: route, callback: callback });
};

interface BrowserHistory {
  // Checks the current URL to see if it has changed, and if it has,
  // calls `loadUrl`, normalizing across the hidden iframe.
  checkUrl(): void | boolean;

  // Attempt to load the current URL fragment. If a route succeeds with a
  // match, returns `true`. If no defined routes matches the fragment,
  // returns `false`.
  loadUrl(fragmentOverride?: string): boolean;
}
BrowserHistoryProto.checkUrl = function (this: BrowserHistory) {
  let current = this.getFragment();

  // If the user pressed the back button, the iframe's hash will have
  // changed and we should use that for comparison.
  if (current === this.fragment && this.iframe) {
    current = this.getHash(this.iframe.contentWindow);
  }

  if (current === this.fragment) return false;
  if (this.iframe) this.navigate(current);
  this.loadUrl();
};
BrowserHistoryProto.loadUrl = function (this: BrowserHistory, fragmentOverride) {
  // If the root doesn't match, no routes can match either.
  if (!this.matchRoot()) return false;
  const fragment = (this.fragment = this.getFragment(fragmentOverride));
  return this.handlers.some(handler => {
    if (handler.route.test(fragment)) {
      handler.callback(fragment);
      return true;
    }
  });
};

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
BrowserHistoryProto.navigate = function (
  this: BrowserHistory,
  fragment,
  options
) {
  if (!BrowserHistory.started) {
    return false;
  }

  const pathStripper = /#.*$/;

  if (!options || options === true) {
    options = { trigger: !!options };
  }

  // Normalize the fragment.
  fragment = this.getFragment(fragment || "");

  // Don't include a trailing slash on the root.
  var rootPath = this.root;
  if (fragment === "" || fragment.charAt(0) === "?") {
    rootPath = rootPath.slice(0, -1) || "/";
  }
  var url = rootPath + fragment;

  // Strip the hash and decode for matching.
  fragment = this.decodeFragment(fragment.replace(pathStripper, ""));

  if (this.fragment === fragment) {
    return;
  }
  this.fragment = fragment;

  // If pushState is available, we use it to set the fragment as a real URL.
  if (this._usePushState) {
    this.history[options.replace ? "replaceState" : "pushState"](
      {},
      document.title,
      url
    );

    // If hash changes haven't been explicitly disabled, update the hash
    // fragment to store history.
  } else if (this._wantsHashChange) {
    this._updateHash(this.location, fragment, options.replace);
    if (this.iframe && fragment !== this.getHash(this.iframe.contentWindow)) {
      var iWindow = this.iframe.contentWindow;

      // Opening and closing the iframe tricks IE7 and earlier to push a
      // history entry on hash-tag change.  When replace is true, we don't
      // want this.
      if (!options.replace) {
        iWindow.document.open();
        iWindow.document.close();
      }

      this._updateHash(iWindow.location, fragment, options.replace);
    }

    // If you've told us that you explicitly don't want fallback hashchange-
    // based history, then `navigate` becomes a page refresh.
  } else {
    return this.location.assign(url);
  }
  if (options.trigger) {
    return this.loadUrl(fragment);
  }
};

interface BrowserHistory {
  // Update the hash location, either replacing the current entry, or adding
  // a new one to the browser history.
  _updateHash(location: Location, fragment: string, replace: boolean): void;
}
BrowserHistoryProto._updateHash = function (
  this: BrowserHistory,
  location,
  fragment,
  replace
) {
  if (replace) {
    var href = location.href.replace(/(javascript:|#).*$/, "");
    location.replace(href + "#" + fragment);
  } else {
    // Some browsers require that `hash` contains a leading #.
    location.hash = "#" + fragment;
  }
};

interface BrowserHistory {
  _subscribeToEvents(): void;
  _hashChanged(): void;

  _isHashInRoutes(hash: string): boolean;

  _checkDefaultHash(): void;

  _addHash(hash: string);

  getPreviousHash(): string;
}
BrowserHistoryProto._subscribeToEvents = function (this: BrowserHistory) {
  window.addEventListener("hashchange", () => {
    this._hashChanged();
  });
};
BrowserHistoryProto._hashChanged = function (this: BrowserHistory) {
  const hash = this.getHash();
  if (this.options.validateHash) {
    var _isHashInRoutes = this._isHashInRoutes(hash);
    if (_isHashInRoutes) {
      this._addHash(hash);
    }
  } else {
    this._addHash(hash);
  }
};
BrowserHistoryProto._checkDefaultHash = function (this: BrowserHistory) {
  const hash = this.getHash();
  if (hash) {
    this._addHash(hash);
  }
};
BrowserHistoryProto._isHashInRoutes = function (this: BrowserHistory, hash) {
  const handlers = this.handlers;
  let isExist = false;
  for (var i = 0, len = handlers.length; i < len; i++) {
    let handler = handlers[i];
    if (handler.route.toString() === _routeToRegExp(hash).toString()) {
      isExist = true;
      break;
    }
  }
  return isExist;
};
BrowserHistoryProto.getPreviousHash = function (this: BrowserHistory) {
  if (!BrowserHistory.started) {
    throw "BrowserHistory has not been started";
  }
  const _hashes = this._hashes || [];
  return _hashes[0] || "";
};

Object.assign(BrowserHistory.prototype, EventMixin);

const BrowserHistoryInstance = BrowserHistory.getInstance();

// Create the default BrowserHistory.
export { BrowserHistoryInstance };
