import { EventType } from "./event";
import { Logger } from "./logger.service";

export class EventHandler {
  constructor(private readonly logger: Logger) {}

  handle<T extends Pick<EventType, "name">>(fn: (event: T) => Promise<void>) {
    return async (event: T) => {
      try {
        await fn(event);
      } catch (error) {
        this.logger.error({
          message: `Unknown ${event.name} event handler error`,
          operation: "unknown_event_handler_error",
          metadata: this.logger.formatError(error),
        });
      }
    };
  }
}
