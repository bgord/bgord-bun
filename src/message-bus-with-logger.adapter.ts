import { CorrelationStorage } from "./correlation-storage.service";
import type { LogCoreType, LoggerPort } from "./logger.port";
import type { Message, ToMessageMap } from "./message.types";
import type { MessageBusPort } from "./message-bus.port";

type Dependencies = { Logger: LoggerPort };

export class MessageBusWithLoggerAdapter<Messages extends Message> implements MessageBusPort<Messages> {
  private readonly base = { component: "infra", operation: "message_bus_emit" };

  constructor(
    private readonly inner: MessageBusPort<Messages>,
    private readonly deps: Dependencies,
  ) {}

  async emit<M extends Messages>(message: M): Promise<void> {
    this.deps.Logger.info({
      message: `${message.name} emitted`,
      metadata: message as LogCoreType["metadata"],
      correlationId: CorrelationStorage.get(),
      ...this.base,
    });

    return this.inner.emit(message);
  }

  on<MessageName extends keyof ToMessageMap<Messages>>(
    name: MessageName,
    handler: (message: ToMessageMap<Messages>[MessageName]) => void | Promise<void>,
  ): void {
    this.inner.on(name, handler);
  }
}

export const EventBusWithLoggerAdapter = MessageBusWithLoggerAdapter;
export const CommandBusWithLoggerAdapter = MessageBusWithLoggerAdapter;
