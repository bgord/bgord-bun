import type { z } from "zod/v4";
import type { ClockPort } from "./clock.port";
import type { GenericEventSchema } from "./event.types";
import type { EventHandlerPort } from "./event-handler.port";
import type { LoggerPort } from "./logger.port";
import { formatError } from "./logger-format-error.service";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

export class EventHandlerWithLoggerAdapter implements EventHandlerPort {
  constructor(private readonly deps: Dependencies) {}

  handle<T extends { name: z.infer<GenericEventSchema["shape"]["name"]> }>(fn: (event: T) => Promise<void>) {
    return async (event: T) => {
      const stopwatch = new Stopwatch(this.deps.Clock.now());

      try {
        await fn(event);
      } catch (error) {
        this.deps.Logger.error({
          message: `Unknown ${event.name} event handler error`,
          component: "infra",
          operation: "event_handler",
          metadata: { name: event.name, duration: stopwatch.stop() },
          error: formatError(error),
        });
      }
    };
  }
}
