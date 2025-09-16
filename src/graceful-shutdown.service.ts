import * as tools from "@bgord/tools";
import type { LoggerPort } from "./logger.port";
import { formatError } from "./logger-format-error.service";

type ServerType = ReturnType<typeof Bun.serve>;

export class GracefulShutdown {
  constructor(private readonly logger: LoggerPort) {}

  private async shutdown(server: ServerType, callback: () => any = tools.noop) {
    server.stop();
    await callback();
    this.logger.info({ message: "HTTP server closed", operation: "shutdown", component: "infra" });
  }

  applyTo(server: ServerType, callback: () => any = tools.noop) {
    process.once("SIGTERM", async () => {
      this.logger.info({ message: "SIGTERM signal received", operation: "shutdown", component: "infra" });
      await this.shutdown(server, callback);
      process.exit(0);
    });

    process.once("SIGINT", async () => {
      this.logger.info({ message: "SIGINT signal received", operation: "shutdown", component: "infra" });
      await this.shutdown(server, callback);
      process.exit(0);
    });

    process.once("unhandledRejection", async (event) => {
      this.logger.error({
        message: "UnhandledRejection received",
        operation: "shutdown",
        component: "infra",
        error: formatError(event),
      });

      await this.shutdown(server, callback);
      process.exit(1);
    });

    process.once("uncaughtException", async (error) => {
      this.logger.error({
        message: "UncaughtException received",
        operation: "shutdown",
        component: "infra",
        error: formatError(error),
      });
      await this.shutdown(server, callback);
      process.exit(1);
    });
  }
}
