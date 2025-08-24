import type { z } from "zod/v4";
import type { GenericEventSchema } from "./event.types";
import type { LoggerPort } from "./logger.port";
import { formatError } from "./logger-format-error.service";

export class EventHandler {
  constructor(private readonly logger: LoggerPort) {}

  handle<T extends { name: z.infer<GenericEventSchema["shape"]["name"]> }>(fn: (event: T) => Promise<void>) {
    return async (event: T) => {
      try {
        await fn(event);
      } catch (error) {
        this.logger.error({
          message: `Unknown ${event.name} event handler error`,
          component: "infra",
          operation: "unknown_event_handler_error",
          error: formatError(error),
          metadata: { name: event.name },
        });
      }
    };
  }
}
