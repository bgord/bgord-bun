import type { CommandBusPort } from "./command-bus.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { LogCoreType, LoggerPort } from "./logger.port";
import type { Message, ToMessageMap } from "./message.types";

type Dependencies = { Logger: LoggerPort };

export class CommandBusWithLoggerAdapter<Command extends Message> implements CommandBusPort<Command> {
  private readonly base = { component: "infra", operation: "command_emitted" };

  constructor(
    private readonly inner: CommandBusPort<Command>,
    private readonly deps: Dependencies,
  ) {}

  async emit<C extends Command>(command: C): Promise<void> {
    this.deps.Logger.info({
      message: `${command.name} emitted`,
      metadata: command as LogCoreType["metadata"],
      correlationId: CorrelationStorage.get(),
      ...this.base,
    });

    return this.inner.emit(command);
  }

  on<CommandName extends keyof ToMessageMap<Command>>(
    name: CommandName,
    handler: (command: ToMessageMap<Command>[CommandName]) => void | Promise<void>,
  ): void {
    this.inner.on(name, handler);
  }
}
