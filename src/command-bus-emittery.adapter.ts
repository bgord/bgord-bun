import Emittery from "emittery";
import type { CommandBusPort } from "./command-bus.port";
import type { Message, ToMessageMap } from "./message.types";

export class CommandBusEmitteryAdapter<Command extends Message> implements CommandBusPort<Command> {
  private readonly emittery: Emittery<ToMessageMap<Command>>;

  constructor() {
    this.emittery = new Emittery<ToMessageMap<Command>>();
  }

  async emit<C extends Command>(command: C): Promise<void> {
    await this.emittery.emit(
      command.name as keyof ToMessageMap<Command>,
      command as ToMessageMap<Command>[keyof ToMessageMap<Command>],
    );
  }

  on<CommandName extends keyof ToMessageMap<Command>>(
    name: CommandName,
    handler: (command: ToMessageMap<Command>[CommandName]) => void | Promise<void>,
  ): void {
    this.emittery.on(name, handler);
  }
}
