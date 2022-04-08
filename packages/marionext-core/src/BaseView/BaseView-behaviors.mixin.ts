import { _ } from "marionext-lodash";

import { _invoke } from "../Utils/Utils-functions";
import { MnError } from "../Utils/error";
import { Model, Collection } from "marionext-data";
import { View } from "../View";
import { CollectionView } from "../CollectionView";
    
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

const BehaviorsMixin: BehaviorsMixin = (function () {
  // Takes care of getting the behavior class
  // given options and a key.
  // If a user passes in options.behaviorClass
  // default to using that.
  // If a user passes in a Behavior Class directly, use that
  // Otherwise an error is thrown
  function getBehaviorClass(options) {
    if (options.behaviorClass) {
      return { BehaviorClass: options.behaviorClass, options };
    }

    //treat functions as a Behavior constructor
    if (_.isFunction(options)) {
      return { BehaviorClass: options, options: {} };
    }

    throw new MnError({
      message:
        "Unable to get behavior class. A Behavior constructor should be passed directly or as behaviorClass property of options",
      url: "marionette.behavior.html#defining-and-attaching-behaviors"
    });
  }

  // Iterate over the behaviors object, for each behavior
  // instantiate it and get its grouped behaviors.
  // This accepts a list of behaviors in either an object or array form
  function parseBehaviors(view: any, behaviors: any, allBehaviors: any[]) {
    // TODO: precise the view, behaviors and allBehaviors parameters.

    return behaviors.reduce((reducedBehaviors, behaviorDefiniton) => {
      const { BehaviorClass, options } = getBehaviorClass(behaviorDefiniton);
      const behavior = new BehaviorClass(options, view);
      reducedBehaviors.push(behavior);

      const _childBehaviors = _.result(behavior, "behaviors");
      return _childBehaviors
        ? parseBehaviors(view, _childBehaviors, reducedBehaviors)
        : reducedBehaviors;
    }, allBehaviors);
  }

  return {
    _initBehaviors(this: GenericView) {
      const _behaviors = _.result(this, "behaviors");

      this._behaviors = _behaviors ? parseBehaviors(this, _behaviors, []) : [];
    },

    _getBehaviorTriggers(this: GenericView) {
      const triggers = _invoke(this._behaviors, "_getTriggers");
      return triggers.reduce((memo, _triggers) => {
        return Object.assign(memo, _triggers);
      }, {});
    },

    _getBehaviorEvents(this: GenericView) {
      const events = _invoke(this._behaviors, "_getEvents");
      return events.reduce((memo, _events) => {
        return Object.assign(memo, _events);
      }, {});
    },

    // proxy behavior $el to the view's $el.
    _proxyBehaviorViewProperties(this: GenericView) {
      _invoke(this._behaviors, "proxyViewProperties");
    },

    // delegate modelEvents and collectionEvents
    _delegateBehaviorEntityEvents(this: GenericView) {
      _invoke(this._behaviors, "delegateEntityEvents");
    },

    // undelegate modelEvents and collectionEvents
    _undelegateBehaviorEntityEvents(this: GenericView) {
      _invoke(this._behaviors, "undelegateEntityEvents");
    },

    _destroyBehaviors(this: GenericView, options) {
      // Call destroy on each behavior after
      // destroying the view.
      // This unbinds event listeners
      // that behaviors have registered for.
      _invoke(this._behaviors, "destroy", options);
    },

    // Remove a behavior
    _removeBehavior(this: GenericView, behavior) {
      // Don"t worry about the clean up if the view is destroyed
      if (this._isDestroyed) {
        return;
      }

      // Remove behavior-only triggers and events
      this.undelegate(`.trig${behavior.cid} .${behavior.cid}`);

      this._behaviors = _.without(this._behaviors, behavior);
    },

    _bindBehaviorUIElements(this: GenericView) {
      _invoke(this._behaviors, "bindUIElements");
    },

    _unbindBehaviorUIElements(this: GenericView) {
      _invoke(this._behaviors, "unbindUIElements");
    },

    _triggerEventOnBehaviors(this: GenericView, eventName, view, options) {
      _invoke(this._behaviors, "triggerMethod", eventName, view, options);
    }
  } as BehaviorsMixin;
})();

export { BehaviorsMixin };
