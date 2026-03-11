import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import type { Message } from "./message.types";
import type { SseConnectionPort } from "./sse-connection.port";

type Dependencies<Messages extends Message> = { inner: SseConnectionPort<Messages>; Logger: LoggerPort };

export class SseConnectionWithLoggerAdapter<Messages extends Message> implements SseConnectionPort<Messages> {
  private readonly base = { component: "infra", operation: "sse_connection" };

  constructor(private readonly deps: Dependencies<Messages>) {}

  async send<M extends Messages>(message: M) {
    this.deps.Logger.debug({
      message: `${message.name} sent`,
      metadata: message,
      correlationId: CorrelationStorage.get(),
      ...this.base,
    });

    await this.deps.inner.send(message);
  }
}
