import { Application } from "../Application";
import { Manager } from "../Manager";

type DestroyObject = Application | Manager;
/**
 * DestroyMixin
 * --------------
 * Used by Application & Manager
 */
interface DestroyMixin {
  _isDestroyed: boolean;
  isDestroyed(): boolean;
  destroy(options?: ObjectHash);
}
const DestroyMixin: DestroyMixin = {
  _isDestroyed: false,

  isDestroyed(this: DestroyObject) {
    return this._isDestroyed;
  },

  destroy(this: DestroyObject, options) {
    if (this._isDestroyed) { return this; }

    this.triggerMethod("before:destroy", this, options);
    this._isDestroyed = true;
    this.triggerMethod("destroy", this, options);
    this.stopListening();

    return this;
  }
};

export { DestroyMixin };
