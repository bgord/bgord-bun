import type { EventBusPort } from "./event-bus.port";
import type { ToEventMap } from "./to-event-map.types";

export class EventBusCollectingAdapter<E extends { name: string }> implements EventBusPort<E> {
  public events: Array<E> = [];

  async emit<K extends keyof ToEventMap<E>>(_name: K, event: ToEventMap<E>[K]): Promise<void> {
    this.events.push(event as E);
  }

  on<K extends keyof ToEventMap<E>>(
    _name: K,
    _handler: (event: ToEventMap<E>[K]) => void | Promise<void>,
  ): void {}
}
