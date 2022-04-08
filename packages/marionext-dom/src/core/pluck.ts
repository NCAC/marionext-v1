import { _ } from "marionext-lodash";
import { Ele } from "./types";
import { push } from "../variables";

type PluckCallback<T> = (ele: T) => ArrayLike<Ele>;

export function pluck<T, U extends ArrayLike<T> = ArrayLike<T>>(
  arr: U,
  prop: PluckCallback<U[0]>
): Array<Ele>;

export function pluck<T, U extends ArrayLike<T> = ArrayLike<T>>(
  arr: U,
  prop: string,
  deep?: boolean
): Array<Ele>;

export function pluck<T, U extends ArrayLike<T> = ArrayLike<T>>(
  arr: U,
  prop: string | PluckCallback<U[0]>,
  deep?: boolean
): Array<Ele> {
  const plucked: Array<Ele> = [];

  for (let i = 0, l = arr.length; i < l; i++) {
    if (_.isString(prop)) {
      let val = arr[i][prop];
      while (val != null) {
        plucked.push(val);
        val = deep ? val[prop] : null;
      }
    } else {
      const val = prop(arr[i]);
      if (val.length) {
        push.apply(plucked, val);
      }
    }
  }

  return plucked;
}
