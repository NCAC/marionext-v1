import { EventMixinOn } from "../on";
import { EventMixinOnce } from "../once";
import { EventMixinOff } from "../off";
import { EventMixinTrigger } from "../trigger";

declare global {
  interface EventHandler {
    (...args: any[]): void
    _callback?: EventHandler;
  }
  interface EventMap {
    [event: string]: EventHandler;
  }
  interface _events {
    [key: string]: _recordedEvents[];
  }
}

interface _recordedEvents {
  callback: EventHandler;
  context: any;
  ctx: any;
  listening: any;
}


export interface _listenings {
  [key: string]: {
    obj: any;
    objId: string;
    id: string;
    listeningTo?: _listenings;
    count: number;
  };
}

export interface EventMixinObjProps {
  _events?: _events;
  _listeners?: _listenings;
  _listeningTo?: _listenings;
  _listenId?: string;
}

export interface EventMixin
  extends EventMixinOn,
  EventMixinOnce,
  EventMixinOff,
  EventMixinTrigger,
  EventMixinObjProps { }

export interface EventMixinObj extends EventMixin {
  [key: string]: any;
}

export const EventMixin: EventMixin = Object.assign(
  EventMixinOn,
  EventMixinOff,
  EventMixinOnce,
  EventMixinTrigger
);
