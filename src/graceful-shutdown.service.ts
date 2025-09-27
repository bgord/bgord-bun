import * as tools from "@bgord/tools";
import type { LoggerPort } from "./logger.port";
import { formatError } from "./logger-format-error.service";

type ServerType = ReturnType<typeof Bun.serve>;

type GracefulShutdownOptions = { exitFn?: (code: number) => never };

export class GracefulShutdown {
  private readonly base = { operation: "shutdown", component: "infra" } as const;
  private readonly exitFn: (code: number) => never;
  private isShuttingDown = false;

  constructor(
    private readonly logger: LoggerPort,
    options: GracefulShutdownOptions = {},
  ) {
    this.exitFn = options.exitFn ?? ((code: number) => process.exit(code));
  }

  private async shutdown(server: ServerType, cleanup: () => any, exitCode: number) {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    try {
      server.stop();
    } catch (error) {
      this.logger.error({ message: "Server stop failed", error: formatError(error), ...this.base });
    }

    try {
      await cleanup();
      this.logger.info({ message: "HTTP server closed", ...this.base });
    } catch (error) {
      this.logger.error({ message: "Cleanup hook failed", error: formatError(error), ...this.base });
    } finally {
      this.exitFn(exitCode);
    }
  }

  applyTo(server: ServerType, cleanup: () => any = tools.noop) {
    process.once("SIGTERM", async () => {
      this.logger.info({ message: "SIGTERM received", ...this.base });
      await this.shutdown(server, cleanup, 0);
    });

    process.once("SIGINT", async () => {
      this.logger.info({ message: "SIGINT received", ...this.base });
      await this.shutdown(server, cleanup, 0);
    });

    process.once("unhandledRejection", async (reason /*, promise*/) => {
      this.logger.error({ message: "UnhandledRejection received", error: formatError(reason), ...this.base });
      await this.shutdown(server, cleanup, 1);
    });

    process.once("uncaughtException", async (error) => {
      this.logger.error({ message: "UncaughtException received", error: formatError(error), ...this.base });
      await this.shutdown(server, cleanup, 1);
    });
  }
}
