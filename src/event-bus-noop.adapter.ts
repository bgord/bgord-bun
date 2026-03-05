import type { EventBusPort } from "./event-bus.port";
import type { ToEventMap } from "./to-event-map.types";

export class EventBusNoopAdapter<E extends { name: string }> implements EventBusPort<E> {
  async emit<K extends keyof ToEventMap<E>>(_name: K, _event: ToEventMap<E>[K]): Promise<void> {}

  on<K extends keyof ToEventMap<E>>(
    _name: K,
    _handler: (event: ToEventMap<E>[K]) => void | Promise<void>,
  ): void {}
}
