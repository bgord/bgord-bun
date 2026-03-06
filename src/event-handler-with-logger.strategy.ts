import type { ClockPort } from "./clock.port";
import type { EventHandlerStrategy } from "./event-handler.strategy";
import type { LoggerPort } from "./logger.port";
import type { Message } from "./message.types";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

export class EventHandlerWithLoggerStrategy implements EventHandlerStrategy {
  constructor(private readonly deps: Dependencies) {}

  handle<Event extends Message>(handler: (event: Event) => Promise<void>) {
    return async (event: Event) => {
      const duration = new Stopwatch(this.deps);

      try {
        await handler(event);
      } catch (error) {
        this.deps.Logger.error({
          message: `Unknown ${event.name} event handler error`,
          component: "infra",
          operation: "event_handler",
          metadata: { name: event.name, duration: duration.stop() },
          error,
        });
      }
    };
  }
}
