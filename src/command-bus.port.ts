import type { Message, ToMessageMap } from "./message.types";

export interface CommandBusPort<Command extends Message> {
  emit<C extends Command>(command: C): Promise<void>;

  on<CommandName extends keyof ToMessageMap<Command>>(
    name: CommandName,
    handler: (command: ToMessageMap<Command>[CommandName]) => void | Promise<void>,
  ): void;
}
