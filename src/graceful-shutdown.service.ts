import * as tools from "@bgord/tools";
import type { LoggerPort } from "./logger.port";
import { formatError } from "./logger-format-error.service";

type ServerType = ReturnType<typeof Bun.serve>;

export class GracefulShutdown {
  private readonly base = { operation: "shutdown", component: "infra" } as const;
  private isShuttingDown = false;

  constructor(
    private readonly logger: LoggerPort,
    private readonly exitFn: (code: number) => never = ((code: number) => process.exit(code)) as never,
  ) {}

  private shutdown(server: ServerType, cleanup: () => any, exitCode: number) {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    try {
      server.stop();
    } catch (error) {
      this.logger.error({ message: "Server stop failed", error: formatError(error), ...this.base });
    }

    Promise.resolve()
      .then(() => cleanup())
      .then(() => this.logger.info({ message: "HTTP server closed", ...this.base }))
      .catch((error) =>
        this.logger.error({ message: "Cleanup hook failed", error: formatError(error), ...this.base }),
      )
      .finally(() => {
        this.exitFn(exitCode);
      });
  }

  applyTo(server: ServerType, cleanup: () => any = tools.noop) {
    process.once("SIGTERM", () => {
      this.logger.info({ message: "SIGTERM received", ...this.base });
      this.shutdown(server, cleanup, 0);
    });

    process.once("SIGINT", () => {
      this.logger.info({ message: "SIGINT received", ...this.base });
      this.shutdown(server, cleanup, 0);
    });

    process.once("unhandledRejection", (reason) => {
      this.logger.error({ message: "UnhandledRejection received", error: formatError(reason), ...this.base });
      this.shutdown(server, cleanup, 1);
    });

    process.once("uncaughtException", (error) => {
      this.logger.error({ message: "UncaughtException received", error: formatError(error), ...this.base });
      this.shutdown(server, cleanup, 1);
    });
  }
}
