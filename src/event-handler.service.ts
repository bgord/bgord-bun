import { z } from "zod/v4";
import type { GenericEventSchema } from "./event.types";
import { Logger } from "./logger.service";

export class EventHandler {
  constructor(private readonly logger: Logger) {}

  handle<T extends { name: z.infer<GenericEventSchema["shape"]["name"]> }>(fn: (event: T) => Promise<void>) {
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
