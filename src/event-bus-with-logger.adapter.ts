import { CorrelationStorage } from "./correlation-storage.service";
import type { LogCoreType, LoggerPort } from "./logger.port";
import type { Message, ToMessageMap } from "./message.types";
import type { EventBusPort } from "./message-bus.port";

type Dependencies = { Logger: LoggerPort };

export class EventBusWithLoggerAdapter<Event extends Message> implements EventBusPort<Event> {
  private readonly base = { component: "infra", operation: "event_emitted" };

  constructor(
    private readonly inner: EventBusPort<Event>,
    private readonly deps: Dependencies,
  ) {}

  async emit<E extends Event>(event: E): Promise<void> {
    this.deps.Logger.info({
      message: `${event.name} emitted`,
      metadata: event as LogCoreType["metadata"],
      correlationId: CorrelationStorage.get(),
      ...this.base,
    });

    return this.inner.emit(event);
  }

  on<EventName extends keyof ToMessageMap<Event>>(
    name: EventName,
    handler: (event: ToMessageMap<Event>[EventName]) => void | Promise<void>,
  ): void {
    this.inner.on(name, handler);
  }
}
