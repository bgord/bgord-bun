import type { ClockPort } from "./clock.port";
import type { LoggerPort } from "./logger.port";
import type { Message } from "./message.types";
import type { MessageHandlerStrategy } from "./message-handler.strategy";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

export class MessageHandlerWithLoggerStrategy implements MessageHandlerStrategy {
  constructor(private readonly deps: Dependencies) {}

  handle<M extends Message>(handler: (message: M) => Promise<void>) {
    return async (message: M) => {
      const duration = new Stopwatch(this.deps);

      try {
        await handler(message);
      } catch (error) {
        this.deps.Logger.error({
          message: `Unknown ${message.name} message handler error`,
          component: "infra",
          operation: "message_handler",
          metadata: { name: message.name, duration: duration.stop() },
          error,
        });
      }
    };
  }
}

export type EventHandlerWithLoggerStrategy = MessageHandlerWithLoggerStrategy;
export type CommandHandlerWithLoggerStrategy = MessageHandlerWithLoggerStrategy;
