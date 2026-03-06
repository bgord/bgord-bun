import type { CommandBusPort } from "./command-bus.port";
import type { LogCoreType, LoggerPort } from "./logger.port";
import type { ToEventMap } from "./to-event-map.types";

type Dependencies = { Logger: LoggerPort };

export class CommandBusWithLoggerAdapter<C extends { name: string }> implements CommandBusPort<C> {
  private readonly base = { component: "infra", operation: "command_emitted" };

  constructor(
    private readonly inner: CommandBusPort<C>,
    private readonly deps: Dependencies,
  ) {}

  async emit<K extends keyof ToEventMap<C>>(name: K, command: ToEventMap<C>[K]): Promise<void> {
    this.deps.Logger.info({
      message: `${name.toString()} emitted`,
      metadata: command as LogCoreType["metadata"],
      ...this.base,
    });

    return this.inner.emit(name, command);
  }

  on<K extends keyof ToEventMap<C>>(
    name: K,
    handler: (command: ToEventMap<C>[K]) => void | Promise<void>,
  ): void {
    console.log("here");
    this.inner.on(name, handler);
  }
}
