import * as tools from "@bgord/tools";
import type { LoggerPort } from "./logger.port";
import { formatError } from "./logger-format-error.service";

type ServerType = ReturnType<typeof Bun.serve>;

export class GracefulShutdown {
  constructor(private readonly logger: LoggerPort) {}

  private readonly base = { operation: "shutdown", component: "infra" } as const;

  private async shutdown(server: ServerType, cleanup: () => any = tools.noop) {
    server.stop();

    try {
      await cleanup();

      this.logger.info({ message: "HTTP server closed", ...this.base });
    } catch (error) {
      this.logger.error({ message: "Cleanup hook failed", error: formatError(error), ...this.base });
    }
  }

  applyTo(server: ServerType, cleanup: () => any = tools.noop) {
    process.once("SIGTERM", async () => {
      this.logger.info({ message: "SIGTERM received", ...this.base });
      await this.shutdown(server, cleanup);
      process.exitCode = 0;
    });

    process.once("SIGINT", async () => {
      this.logger.info({ message: "SIGINT received", ...this.base });
      await this.shutdown(server, cleanup);
      process.exitCode = 0;
    });

    process.once("unhandledRejection", async (event) => {
      this.logger.error({ message: "UnhandledRejection received", error: formatError(event), ...this.base });
      await this.shutdown(server, cleanup);
      process.exitCode = 1;
    });

    process.once("uncaughtException", async (error) => {
      this.logger.error({ message: "UncaughtException received", error: formatError(error), ...this.base });
      await this.shutdown(server, cleanup);
      process.exitCode = 1;
    });
  }
}
