import Emittery from "emittery";
import type { CommandBusPort } from "./command-bus.port";
import type { Message, ToMessageMap } from "./message.types";

export class CommandBusEmitteryV1Adapter<Command extends Message> implements CommandBusPort<Command> {
  private readonly emittery: Emittery<ToMessageMap<Command>>;

  constructor() {
    this.emittery = new Emittery<ToMessageMap<Command>>();
  }

  async emit<CommandName extends keyof ToMessageMap<Command>>(
    name: CommandName,
    command: ToMessageMap<Command>[CommandName],
  ): Promise<void> {
    await this.emittery.emit(name, command);
  }

  on<CommandName extends keyof ToMessageMap<Command>>(
    name: CommandName,
    handler: (command: ToMessageMap<Command>[CommandName]) => void | Promise<void>,
  ): void {
    this.emittery.on(name, handler);
  }
}
