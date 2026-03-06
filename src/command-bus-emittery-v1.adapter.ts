import Emittery from "emittery";
import type { CommandBusPort } from "./command-bus.port";
import type { Message } from "./message.types";
import type { ToEventMap } from "./to-event-map.types";

export class CommandBusEmitteryV1Adapter<Command extends Message> implements CommandBusPort<Command> {
  private readonly emittery: Emittery<ToEventMap<Command>>;

  constructor() {
    this.emittery = new Emittery<ToEventMap<Command>>();
  }

  async emit<CommandName extends keyof ToEventMap<Command>>(
    name: CommandName,
    command: ToEventMap<Command>[CommandName],
  ): Promise<void> {
    await this.emittery.emit(name, command);
  }

  on<CommandName extends keyof ToEventMap<Command>>(
    name: CommandName,
    handler: (command: ToEventMap<Command>[CommandName]) => void | Promise<void>,
  ): void {
    this.emittery.on(name, handler);
  }
}
