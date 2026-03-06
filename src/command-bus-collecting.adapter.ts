import type { CommandBusPort } from "./command-bus.port";
import type { Message } from "./message.types";
import type { ToEventMap } from "./to-event-map.types";

export class CommandBusCollectingAdapter<Command extends Message> implements CommandBusPort<Command> {
  public commands: Array<Command> = [];

  async emit<CommandName extends keyof ToEventMap<Command>>(
    _name: CommandName,
    command: ToEventMap<Command>[CommandName],
  ): Promise<void> {
    this.commands.push(command as Command);
  }

  on<CommandName extends keyof ToEventMap<Command>>(
    _name: CommandName,
    _handler: (command: ToEventMap<Command>[CommandName]) => void | Promise<void>,
  ): void {}
}
