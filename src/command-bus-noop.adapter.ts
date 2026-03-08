import type { Message, ToMessageMap } from "./message.types";
import type { CommandBusPort } from "./message-bus.port";

export class CommandBusNoopAdapter<Command extends Message> implements CommandBusPort<Command> {
  async emit<C extends Command>(_command: C): Promise<void> {}

  on<CommandName extends keyof ToMessageMap<Command>>(
    _name: CommandName,
    _handler: (command: ToMessageMap<Command>[CommandName]) => void | Promise<void>,
  ): void {}
}
