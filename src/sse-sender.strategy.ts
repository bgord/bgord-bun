import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import type { Message } from "./message.types";

export type SseSenderStrategy<Messages extends Message> = <M extends Messages>(message: M) => Promise<void>;

export type SseSendDecorator<Messages extends Message> = (
  send: SseSenderStrategy<Messages>,
) => SseSenderStrategy<Messages>;

export function SseSenderBare<Messages extends Message>(): SseSendDecorator<Messages> {
  return (send) => send;
}

export function SseSenderWithLogger<Messages extends Message>(deps: {
  Logger: LoggerPort;
}): SseSendDecorator<Messages> {
  const base = { component: "infra", operation: "sse_send" };

  return (send) =>
    async <M extends Messages>(message: M) => {
      deps.Logger.debug({
        message: `${message.name} sent`,
        metadata: message,
        correlationId: CorrelationStorage.get(),
        ...base,
      });

      await send(message);
    };
}
