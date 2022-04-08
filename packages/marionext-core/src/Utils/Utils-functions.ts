import { _ } from "marionext-lodash";

export const getNamespacedEventName = (function () {
  const delegateEventSplitter = /^(\S+)\s*(.*)$/;
  return function (eventName: string, namespace: string): string {
    const match = eventName.match(delegateEventSplitter);
    return `${match[1]}.${namespace} ${match[2]}`;
  };
})();

export const _invoke = _.invokeMap || _.invoke;
