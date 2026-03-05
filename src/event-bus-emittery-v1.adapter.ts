import Emittery from "emittery";
import type { EventBusPort } from "./event-bus.port";
import type { ToEventMap } from "./to-event-map.types";

export class EventBusEmitteryV1Adapter<E extends { name: string }> implements EventBusPort<E> {
  private readonly emittery: Emittery<ToEventMap<E>>;

  constructor() {
    this.emittery = new Emittery<ToEventMap<E>>();
  }

  async emit<K extends keyof ToEventMap<E>>(name: K, event: ToEventMap<E>[K]): Promise<void> {
    await this.emittery.emit(name, event);
  }

  on<K extends keyof ToEventMap<E>>(
    name: K,
    handler: (event: ToEventMap<E>[K]) => void | Promise<void>,
  ): void {
    this.emittery.on(name, handler);
  }
}
