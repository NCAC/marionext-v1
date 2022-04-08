import { _ } from "marionext-lodash";
export function splice(array, insert, at) {
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
};
//Internal utility for creating context style global utils
export function proxy(method) {
  return function(context, ...args) {
    return method.apply(context, args);
  };
};
export const _invoke = _.invokeMap || _.invoke;