import { z } from "zod/v4";
import type { GenericCommandSchema } from "./command.types";
import { Logger } from "./logger.service";

// TODO: test
export class CommandHandler {
  constructor(private readonly logger: Logger) {}

  handle<T extends { name: z.infer<GenericCommandSchema["shape"]["name"]> }>(
    fn: (command: T) => Promise<void>,
  ) {
    return async (command: T) => {
      try {
        await fn(command);
      } catch (error) {
        this.logger.error({
          message: `Unknown ${command.name} command handler error`,
          operation: "unknown_command_handler_error",
          metadata: this.logger.formatError(error),
        });
      }
    };
  }
}
