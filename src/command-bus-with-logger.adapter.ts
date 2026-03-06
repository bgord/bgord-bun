import type { CommandBusPort } from "./command-bus.port";
import type { LogCoreType, LoggerPort } from "./logger.port";
import type { Message } from "./message.types";
import type { ToEventMap } from "./to-event-map.types";

type Dependencies = { Logger: LoggerPort };

export class CommandBusWithLoggerAdapter<Command extends Message> implements CommandBusPort<Command> {
  private readonly base = { component: "infra", operation: "command_emitted" };

  constructor(
    private readonly inner: CommandBusPort<Command>,
    private readonly deps: Dependencies,
  ) {}

  async emit<CommandName extends keyof ToEventMap<Command>>(
    name: CommandName,
    command: ToEventMap<Command>[CommandName],
  ): Promise<void> {
    this.deps.Logger.info({
      message: `${name.toString()} emitted`,
      metadata: command as LogCoreType["metadata"],
      ...this.base,
    });

    return this.inner.emit(name, command);
  }

  on<CommandName extends keyof ToEventMap<Command>>(
    name: CommandName,
    handler: (command: ToEventMap<Command>[CommandName]) => void | Promise<void>,
  ): void {
    this.inner.on(name, handler);
  }
}
