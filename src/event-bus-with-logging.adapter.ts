import type { EventBusPort } from "./event-bus.port";
import type { LogCoreType, LoggerPort } from "./logger.port";
import type { ToEventMap } from "./to-event-map.types";

type Dependencies = { Logger: LoggerPort };

export class EventBusWithLoggerAdapter<E extends { name: string }> implements EventBusPort<E> {
  private readonly base = { component: "infra", operation: "event_emitted" };

  constructor(
    private readonly inner: EventBusPort<E>,
    private readonly deps: Dependencies,
  ) {}

  async emit<K extends keyof ToEventMap<E>>(name: K, event: ToEventMap<E>[K]): Promise<void> {
    this.deps.Logger.info({
      message: `${name.toString()} emitted`,
      metadata: event as LogCoreType["metadata"],
      ...this.base,
    });

    return this.inner.emit(name, event);
  }

  on<K extends keyof ToEventMap<E>>(
    name: K,
    handler: (event: ToEventMap<E>[K]) => void | Promise<void>,
  ): void {
    return this.inner.on(name, handler);
  }
}
