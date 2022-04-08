import { Region } from "../Region";


interface RegionDestroyMixin {
  _isDestroyed: boolean;
  isDestroyed(): boolean;

  // Destroy the region, remove any child view
  // and remove the region from any associated view
  destroy(options?: ObjectHash): Region;

  // Reset the region by destroying any existing view and clearing out the cached `$el`.
  // The next time a view is shown via this region, the region will re-query the DOM for
  // the region's `el`.
  reset(options?: ObjectHash): Region
};

const RegionDestroyMixin: RegionDestroyMixin = {
  _isDestroyed: false,
  isDestroyed(this: Region) {
    return this._isDestroyed;
  },
  destroy(this: Region, options) {
    if (this._isDestroyed) { return this; }

    this.triggerMethod("before:destroy", this, options);
    this._isDestroyed = true;

    this.reset(options);

    if (this._name) {
      this._parentView._removeReferences(this._name);
    }
    delete this._parentView;
    delete this._name;

    this.triggerMethod('destroy', this, options);
    this.stopListening();

    return this;
  },
  reset(this: Region, options) {
    this.empty(options);

    if (this.$el) {
      this.el = this._initEl;
    }

    delete this.$el;
    return this;
  }
};

export { RegionDestroyMixin };
