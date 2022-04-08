import { _ } from "marionext-lodash";

import { buildRegion } from "./View-buildRegion.function";
import { Region } from "../Region";

import { _invoke } from "../Utils/Utils-functions";

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
  | { el: string; replaceElement?: boolean; regionClass?: Region };
};

export type regionsDefinitions = regionObject | (() => regionObject);

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
  addRegions(regions: regionsDefinitions): { [key: string]: Region };

  // internal method to build and add regions
  _addRegions(regionDefinitions: regionsDefinitions): { [key: string]: Region };

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
  emptyRegions(): { [key: string]: Region };

  // Checks to see if view contains region
  // Accepts the region name
  // hasRegion("main")
  hasRegion(name: string): void;

  // Provides access to regions
  // Accepts the region name
  // getRegion("main")
  getRegion(name: string): Region;

  _getRegions(): { [key: string]: Region };

  // Get all regions
  getRegions(): { [key: string]: Region };

  showChildView(name: string, view: BaseView, options?: ObjectHash): BaseView;

  detachChildView(name: string): GenericView;

  getChildView(name: string): GenericView;
}

const ViewRegionMixin: ViewRegionMixin = {
  regions: {},
  _regions: {},
  regionClass: Region,

  // Internal method to initialize the regions that have been defined in a
  // `regions` attribute on this View.
  _initRegions(this: ViewRegionMixin) {
    // init regions hash
    this.regions = this.regions || {};
    this._regions = {};

    this.addRegions(_.result(this, "regions") as regionsDefinitions);
  },

  // Internal method to re-initialize all of the regions by updating
  // the `el` that they point to
  _reInitRegions(this: BaseView) {
    _invoke(this._regions, "reset");
  },

  // Add a single region, by name, to the View
  addRegion(this: BaseView, name, definition) {
    const regions = {};
    regions[name] = definition;
    return this.addRegions(regions)[name];
  },

  // Add multiple regions as a {name: definition, name2: def2} object literal
  addRegions(this: BaseView, regionsDefinitions) {
    // If there's nothing to add, stop here.
    if (_.isEmpty(regionsDefinitions)) {
      return;
    }

    // Normalize region selectors hash to allow
    // a user to use the @ui. syntax.
    regionsDefinitions = this.normalizeUIValues(regionsDefinitions, "el");

    // Add the regions definitions to the regions property
    this.regions = Object.assign({}, this.regions, regionsDefinitions);

    return this._addRegions(regionsDefinitions);
  },

  // internal method to build and add regions
  _addRegions(this: BaseView, regionsDefinitions) {
    //_.result(obj, prop, defaultValue)
    // const defaultParentEl = function (this, "el") => _.result()
    const defaults = {
      regionClass: this.regionClass,
      parentEl: _.result(this, "el") //_.partial(_.result, this, "el")
    };

    return _.reduce(
      regionsDefinitions,
      (regions, definition, name) => {
        regions[name] = buildRegion(definition, defaults);
        this._addRegion(regions[name], name);
        return regions;
      },
      {}
    );
  },

  _addRegion(this: BaseView, region, name) {
    this.triggerMethod("before:add:region", this, name, region);
    region._parentView = this;
    region._name = name;
    this._regions[name] = region;
    this.triggerMethod("add:region", this, name, region);
  },

  // Remove a single region from the View, by name
  removeRegion(this: BaseView, name) {
    const region = this._regions[name];

    this._removeRegion(region, name);

    return region;
  },

  // Remove all regions from the View
  removeRegions(this: BaseView) {
    const regions = this._getRegions();

    _.each(this._regions, this._removeRegion.bind(this));

    return regions;
  },

  _removeRegion(this: BaseView, region, name) {
    this.triggerMethod("before:remove:region", this, name, region);

    region.destroy();

    this.triggerMethod("remove:region", this, name, region);
  },

  // Called in a region's destroy
  _removeReferences(this: BaseView, name) {
    delete this.regions[name];
    delete this._regions[name];
  },

  // Empty all regions in the region manager, but
  // leave them attached
  emptyRegions(this: BaseView) {
    const regions = this.getRegions();
    _invoke(regions, "empty");
    return regions;
  },

  // Checks to see if view contains region
  // Accepts the region name
  // hasRegion("main")
  hasRegion(this: BaseView, name) {
    return !!this.getRegion(name);
  },

  // Provides access to regions
  // Accepts the region name
  // getRegion("main")
  getRegion(this: BaseView, name) {
    if (!this._isRendered) {
      this.render();
    }
    return this._regions[name];
  },

  _getRegions(this: BaseView) {
    return _.clone(this._regions);
  },

  // Get all regions
  getRegions(this: BaseView) {
    if (!this._isRendered) {
      this.render();
    }
    return this._getRegions();
  },

  showChildView(this: BaseView, name, view, options) {
    const region = this.getRegion(name);
    region.show(view, options);
    return view;
  },

  detachChildView(this: BaseView, name) {
    return this.getRegion(name).detachView();
  },

  getChildView(this: BaseView, name) {
    return this.getRegion(name).currentView;
  }
};

export { ViewRegionMixin };
