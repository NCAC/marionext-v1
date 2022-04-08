import { _ } from "marionext-lodash";
export function splice(array: any[], insert: any[], at: number) {
  at = Math.min(Math.max(at, 0), array.length);
  var tail = Array(array.length - at);
  var length = insert.length;

  for (let i = 0; i < tail.length; i++) {
    tail[i] = array[i + at];
  }
  for (let i = 0; i < length; i++) {
    array[i + at] = insert[i];
  }
  for (let i = 0; i < tail.length; i++) {
    array[i + length + at] = tail[i];
  }
}

//Internal utility for creating context style global utils
export function proxy(method: Function) {
  return function (context, ...args) {
    return method.apply(context, args);
  };
}

export const _invoke = _.invokeMap || _.invoke;

export type extendClass<T> = (protoProps: ObjectHash) => T;
