import type { CommandBusPort } from "./command-bus.port";
import type { Message, ToMessageMap } from "./message.types";

export class CommandBusNoopAdapter<Command extends Message> implements CommandBusPort<Command> {
  async emit<CommandName extends keyof ToMessageMap<Command>>(
    _name: CommandName,
    _command: ToMessageMap<Command>[CommandName],
  ): Promise<void> {}

  on<CommandName extends keyof ToMessageMap<Command>>(
    _name: CommandName,
    _handler: (command: ToMessageMap<Command>[CommandName]) => void | Promise<void>,
  ): void {}
}
