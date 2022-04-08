import { $Dom } from "marionext-dom";
export interface UIHash {
  [key: string]: $Dom;
}

export interface Silenceable {
  silent?: boolean;
}

export interface AddOptions extends Silenceable {
  at?: number;
  merge?: boolean;
  sort?: boolean;
}

export interface Validable {
  validate?: boolean;
}

export interface ModelSetOptions extends Silenceable, Validable {}
