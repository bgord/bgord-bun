import Emittery from "emittery";
import type { CommandBusPort } from "./command-bus.port";
import type { ToEventMap } from "./to-event-map.types";

export class CommandBusEmitteryV1Adapter<C extends { name: string }> implements CommandBusPort<C> {
  private readonly emittery: Emittery<ToEventMap<C>>;

  constructor() {
    this.emittery = new Emittery<ToEventMap<C>>();
  }

  async emit<K extends keyof ToEventMap<C>>(name: K, command: ToEventMap<C>[K]): Promise<void> {
    await this.emittery.emit(name, command);
  }

  on<K extends keyof ToEventMap<C>>(
    name: K,
    handler: (command: ToEventMap<C>[K]) => void | Promise<void>,
  ): void {
    this.emittery.on(name, handler);
  }
}
