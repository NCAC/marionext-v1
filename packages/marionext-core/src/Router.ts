// Router
// ---------------
// Reduce the boilerplate code of handling route events
// and then calling a single method on another object,
// called a controller.
// Have your routers configured to call the method on
// your controller, directly.
//
// Configure a Router with `appRoutes`.
//
// App routers can only take one `controller` object.
// It is recommended that you divide your controller
// objects in to smaller pieces of related functionality
// and have multiple routers / controllers, instead of
// just one giant router and controller.
//
// You can also add standard routes to an Router.

import { _ } from "marionext-lodash";
import { EventMixin } from "marionext-event";

import { _routeToRegExp } from "./Common/Common-routeToRegExp.function";

import { BrowserHistoryInstance } from "./BrowserHistory";
import {
  _bindEvents,
  _unbindEvents
} from "./Common/Common-bindEvents.functions";
import { triggerMethod } from "./Common/Common-triggerMethod.function";
import { normalizeMethods } from "./Common/Common-normalizeMethod.function";
import { _setOptions } from "./Common/Common-setOption.function";
import { getOptions } from "./Common/Common-getOption.function";
import { mergeOptions } from "./Common/Common-mergeOptions.function";

type ControllerHash = {
  [index: string]: Function;
};

export interface RouterOptions {
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
class Router {
  static extend = function (protoProps: ObjectHash) {
    const Parent: typeof Router = this;
    let classProperties = {};
  
    for (let prop in protoProps) {
      if (typeof protoProps[prop] !== "function") {
        classProperties[prop] = protoProps[prop];
      }
    }
  
    class extendedRouter extends Parent {
      // Set a convenience property in case the parent"s prototype is needed later.
      static __super__ = Parent.prototype;
      constructor(options?: RouterOptions) {
        Object.assign(classProperties, options);
        super(classProperties);
      }
    }
  
    // Add static properties to the constructor function, if supplied.
    Object.assign(extendedRouter, Parent);
  
    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    Object.assign(extendedRouter.prototype, Parent.prototype, protoProps);
    extendedRouter.prototype.constructor = extendedRouter;
  
    return extendedRouter as any;
  };
  constructor(options?: RouterOptions) {
    if (!options) {
      options = {};
    }
    this._setOptions(options, ["appRoutes", "controller"]);
    if (options.routes) {
      this.routes = options.routes;
    }
    this._bindRoutes();
    this.initialize.apply(this, arguments);
    const appRoutes = this.appRoutes;
    const controller = this._getController();
    this.processAppRoutes(controller, appRoutes);
    this.on("route", this._processOnRoute, this);
  }
}

const RouterProto = Router.prototype;

Object.assign(Router.prototype, EventMixin, {
  _bindEvents,
  _unbindEvents,
  triggerMethod,
  normalizeMethods,
  getOptions,
  _setOptions,
  mergeOptions,
  initialize() { }
});

interface Router {
  // Execute a route handler with the provided parameters.  This is an
  // excellent place to do pre-route setup or post-route cleanup.
  execute(callback: Function, args: any[], name): false | void;

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
RouterProto.execute = function (this: Router, callback, args, name) {
  if (!_.isFunction(callback)) {
    return false;
  }
  if (callback) callback.apply(this, args);
};
RouterProto.navigate = function (this: Router, fragment, options) {
  BrowserHistoryInstance.navigate(fragment, options);
  return this;
};
RouterProto._extractParameters = function (this: Router, route, fragment) {
  const foundParams = route.exec(fragment);
  var params = route.exec(fragment).slice(1);
  return params.map((param, i) => {
    // Don't decode the search params.
    if (i === params.length - 1) return param || null;
    return param ? decodeURIComponent(param) : null;
  });
};
RouterProto._routeToRegExp = _routeToRegExp;

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
  _processOnRoute(routeName: string, routeArgs): void;

  // Internal method to process the `appRoutes` for the
  // router, and turn them in to routes that trigger the
  // specified method on the specified `controller`.
  processAppRoutes(controller: ControllerHash, appRoutes: StringHash): Router;

  _addAppRoute(controller: ControllerHash, route: string, methodName: string);
}
RouterProto.route = function (this: Router, route, name, callback) {
  const regexRoute = _.isRegExp(route) ? route : this._routeToRegExp(route);
  if (_.isFunction(name)) {
    callback = name;
    name = "";
  }
  if (!callback) {
    callback = this[<string>name];
  }
  var router = this;
  BrowserHistoryInstance.route(regexRoute, function (fragment) {
    var args = router._extractParameters(regexRoute, fragment);
    if (router.execute(callback, args, name) !== false) {
      router.trigger.apply(router, ["route:" + name].concat(args));
      router.trigger("route", name, args);
      BrowserHistoryInstance.trigger("route", router, name, args);
    }
  });
  return this;
};
RouterProto._bindRoutes = function (this: Router) {
  if (!this.routes) return;
  this.routes = _.result(this, "routes");
  var route,
    routes = Object.keys(this.routes);
  while ((route = routes.pop()) != null) {
    this.route(route, this.routes[route]);
  }
};
RouterProto.appRoute = function (this: Router, route, methodName) {
  const controller = this._getController();
  this._addAppRoute(controller, route, methodName);
  return this;
};
RouterProto._getController = function (this: Router) {
  return this.controller;
};
RouterProto._processOnRoute = function (this: Router, routeName, routeArgs) {
  // make sure an onRoute before trying to call it
  if (_.isFunction(this.onRoute)) {
    // find the path that matches the current route
    const routePath = _.invert(this.appRoutes)[routeName];
    this.onRoute(routeName, routePath, routeArgs);
  }
};
RouterProto.processAppRoutes = function (this: Router, controller, appRoutes) {
  if (!appRoutes) {
    return this;
  }

  const routeNames = Object.keys(appRoutes).reverse(); // Backbone requires reverted order of routes

  routeNames.forEach(route => {
    this._addAppRoute(controller, route, appRoutes[route]);
  });

  return this;
};
RouterProto._addAppRoute = function (
  this: Router,
  controller,
  route,
  methodName
) {
  const method: Function = controller[methodName];

  if (!method) {
    throw new Error(`Method "${methodName}" was not found on the controller`);
  }

  this.route(route, methodName, method.bind(controller));
};

export { Router };
