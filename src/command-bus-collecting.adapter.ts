import type { CommandBusPort } from "./command-bus.port";
import type { Message, ToMessageMap } from "./message.types";

export class CommandBusCollectingAdapter<Command extends Message> implements CommandBusPort<Command> {
  public commands: Array<Command> = [];

  async emit<CommandName extends keyof ToMessageMap<Command>>(
    _name: CommandName,
    command: ToMessageMap<Command>[CommandName],
  ): Promise<void> {
    this.commands.push(command as Command);
  }

  on<CommandName extends keyof ToMessageMap<Command>>(
    _name: CommandName,
    _handler: (command: ToMessageMap<Command>[CommandName]) => void | Promise<void>,
  ): void {}
}
