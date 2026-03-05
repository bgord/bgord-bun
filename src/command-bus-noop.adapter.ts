import type { CommandBusPort } from "./command-bus.port";
import type { ToEventMap } from "./to-event-map.types";

export class CommandBusNoopAdapter<C extends { name: string }> implements CommandBusPort<C> {
  async emit<K extends keyof ToEventMap<C>>(_name: K, _command: ToEventMap<C>[K]): Promise<void> {}

  on<K extends keyof ToEventMap<C>>(
    _name: K,
    _handler: (command: ToEventMap<C>[K]) => void | Promise<void>,
  ): void {}
}
