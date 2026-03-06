import type { Message, ToMessageMap } from "./message.types";

export interface CommandBusPort<Command extends Message> {
  emit<CommandName extends keyof ToMessageMap<Command>>(
    name: CommandName,
    command: ToMessageMap<Command>[CommandName],
  ): Promise<void>;

  on<CommandName extends keyof ToMessageMap<Command>>(
    name: CommandName,
    handler: (command: ToMessageMap<Command>[CommandName]) => void | Promise<void>,
  ): void;
}
