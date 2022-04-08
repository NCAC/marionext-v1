import { _ } from "marionext-lodash";
// import {
//   AddOptions,
//   Silenceable,
//   ModelSetOptions
// } from "./marionext-data.interface";
import { Model } from "./Model";
import { Collection, CollectionPredicate } from "./Collection";

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

  interface ModelSetOptions extends Silenceable, Validable { }
}

export {
  Model,
  ModelSetOptions,
  Silenceable,
  AddOptions,
  Collection,
  CollectionPredicate
};
