export interface $DomStaticUnique {
  unique<T>(arr: ArrayLike<T>): ArrayLike<T>;
}

export function $unique<T>(arr: ArrayLike<T>): ArrayLike<T> {
  return arr.length > 1
    ? Array.prototype.filter.call(
        arr,
        (item: T, index: number, self: ArrayLike<T>) =>
          Array.prototype.indexOf.call(self, item) === index
      )
    : arr;
}

export const $DomStaticUniqueMixin: $DomStaticUnique = {
  unique: $unique
};
