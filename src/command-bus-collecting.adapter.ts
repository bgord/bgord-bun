import type { CommandBusPort } from "./command-bus.port";
import type { ToEventMap } from "./to-event-map.types";

export class CommandBusCollectingAdapter<C extends { name: string }> implements CommandBusPort<C> {
  public commands: Array<C> = [];

  async emit<K extends keyof ToEventMap<C>>(_name: K, command: ToEventMap<C>[K]): Promise<void> {
    this.commands.push(command as C);
  }

  on<K extends keyof ToEventMap<C>>(
    _name: K,
    _handler: (command: ToEventMap<C>[K]) => void | Promise<void>,
  ): void {}
}
