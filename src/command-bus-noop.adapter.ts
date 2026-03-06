import type { CommandBusPort } from "./command-bus.port";
import type { Message } from "./message.types";
import type { ToEventMap } from "./to-event-map.types";

export class CommandBusNoopAdapter<Command extends Message> implements CommandBusPort<Command> {
  async emit<CommandName extends keyof ToEventMap<Command>>(
    _name: CommandName,
    _command: ToEventMap<Command>[CommandName],
  ): Promise<void> {}

  on<CommandName extends keyof ToEventMap<Command>>(
    _name: CommandName,
    _handler: (command: ToEventMap<Command>[CommandName]) => void | Promise<void>,
  ): void {}
}
