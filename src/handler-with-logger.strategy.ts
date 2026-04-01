import type { ClockPort } from "./clock.port";
import type { Handleable, HandlerStrategy } from "./handler.strategy";
import type { LoggerPort } from "./logger.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

export class HandlerWithLoggerStrategy implements HandlerStrategy {
  constructor(private readonly deps: Dependencies) {}

  handle<H extends Handleable>(handler: (handleable: H) => Promise<void>) {
    return async (handleable: H) => {
      const duration = new Stopwatch(this.deps);

      try {
        await handler(handleable);
      } catch (error) {
        this.deps.Logger.error({
          message: `Unknown ${handleable.name} handler error`,
          component: "infra",
          operation: "handler",
          metadata: { name: handleable.name, duration: duration.stop() },
          error,
        });

        throw error;
      }
    };
  }
}

export const EventHandlerWithLoggerStrategy = HandlerWithLoggerStrategy;
export const CommandHandlerWithLoggerStrategy = HandlerWithLoggerStrategy;
