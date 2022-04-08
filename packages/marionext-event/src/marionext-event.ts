import { _ } from "marionext-lodash";
import { EventMixin } from "./core";

declare global {
  interface ListenToHash {
    [key: string]: string | ((...args: any[]) => void);
  }
}

export { EventMixin };
