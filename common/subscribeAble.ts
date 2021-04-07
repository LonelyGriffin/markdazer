import { useEffect } from "react";
import { useForceUpdate } from "./hooks/useForceUpdate";

export type subscriber = (object: SubscribeAble) => void;

export class SubscribeAble {
  private subscribers: subscriber[] = [];

  subscribe(cb: subscriber) {
    this.subscribers.push(cb);

    return () => {
      this.subscribers = this.subscribers.filter((x) => x !== cb);
    };
  }
  commit() {
    this.subscribers.forEach((cb) => cb(this));
  }
}

export const useSubscription = (object: SubscribeAble) => {
  const forceUpdate = useForceUpdate();
  useEffect(() => object.subscribe(forceUpdate), [object]);
};
