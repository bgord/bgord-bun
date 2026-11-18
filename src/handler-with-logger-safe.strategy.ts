import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { Handleable, HandlerStrategy } from "./handler.strategy";
import type { LoggerPort } from "./logger.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

export class HandlerWithLoggerSafeStrategy implements HandlerStrategy {
  constructor(private readonly deps: Dependencies) {}

  handle<H extends Handleable>(handler: (handleable: H) => Promise<void>) {
    return async (handleable: H) => {
      const duration = new Stopwatch(this.deps);

      try {
        await handler(handleable);
      } catch (error) {
        this.deps.Logger.error({
          message: `Unknown ${handleable.name} handler error`,
          correlationId: CorrelationStorage.get(),
          component: "infra",
          operation: "handler_safe",
          metadata: { name: handleable.name, duration: duration.stop() },
          error,
        });
      }
    };
  }
}

export const EventHandlerWithLoggerSafeStrategy = HandlerWithLoggerSafeStrategy;
