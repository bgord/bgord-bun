import type { Message } from "./message.types";
import type { ToEventMap } from "./to-event-map.types";

export interface CommandBusPort<Command extends Message> {
  emit<CommandName extends keyof ToEventMap<Command>>(
    name: CommandName,
    command: ToEventMap<Command>[CommandName],
  ): Promise<void>;

  on<CommandName extends keyof ToEventMap<Command>>(
    name: CommandName,
    handler: (command: ToEventMap<Command>[CommandName]) => void | Promise<void>,
  ): void;
}
