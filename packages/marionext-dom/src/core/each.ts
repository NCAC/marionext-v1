export type EachCallback<T> = (this: T, index: number, ele: T) => any;

export interface $DomStaticEach {
  each<T>(arr: ArrayLike<T>, callback: EachCallback<T>): void;
}

export function $each<T, U extends ArrayLike<T> = ArrayLike<T>>(
  arr: U,
  callback: EachCallback<U[0]>,
  reverse?: boolean
): U {
  if (reverse) {
    let i = arr.length;
    while (i--) {
      if (callback.call(arr[i], i, arr[i]) === false) {
        return arr;
      }
    }
  } else {
    for (let i = 0, l = arr.length; i < l; i++) {
      if (callback.call(arr[i], i, arr[i]) === false) return arr;
    }
  }

  return arr;
}

export const $DomStaticEachMixin: $DomStaticEach = {
  each: $each
};
