import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import type { Message, ToMessageMap } from "./message.types";
import type { MessageBusPort } from "./message-bus.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies<Messages extends Message> = {
  inner: MessageBusPort<Messages>;
  Logger: LoggerPort;
  Clock: ClockPort;
};

export class MessageBusWithLoggerAdapter<Messages extends Message> implements MessageBusPort<Messages> {
  private readonly base = { component: "infra", operation: "message_bus" };

  constructor(private readonly deps: Dependencies<Messages>) {}

  async emit<M extends Messages>(message: M): Promise<void> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Message bus emit attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { message },
        ...this.base,
      });

      await this.deps.inner.emit(message);

      this.deps.Logger.info({
        message: "Message bus emit success",
        correlationId: CorrelationStorage.get(),
        metadata: { message, duration: duration.stop() },
        ...this.base,
      });
    } catch (error) {
      this.deps.Logger.error({
        message: "Message bus emit error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { message, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  on<MessageName extends keyof ToMessageMap<Messages>>(
    name: MessageName,
    handler: (message: ToMessageMap<Messages>[MessageName]) => void | Promise<void>,
  ): void {
    this.deps.inner.on(name, handler);
  }
}

export const EventBusWithLoggerAdapter = MessageBusWithLoggerAdapter;
export const CommandBusWithLoggerAdapter = MessageBusWithLoggerAdapter;
