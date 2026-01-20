import * as tools from "@bgord/tools";
import type { LoggerPort } from "./logger.port";

type ServerType = ReturnType<typeof Bun.serve>;

type Dependencies = { Logger: LoggerPort };

export class GracefulShutdown {
  private readonly base = { operation: "shutdown", component: "infra" } as const;
  private isShuttingDown = false;

  constructor(
    private readonly deps: Dependencies,
    private readonly exitFn: (code: number) => never = ((code: number) => process.exit(code)) as never,
  ) {}

  private shutdown(server: ServerType, cleanup: () => any, exitCode: number) {
    // Stryker disable all
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    // Stryker restore all

    try {
      server.stop();
    } catch (error) {
      this.deps.Logger.error({ message: "Server stop failed", error, ...this.base });
    }

    Promise.resolve()
      .then(() => cleanup())
      .then(() => this.deps.Logger.info({ message: "HTTP server closed", ...this.base }))
      .catch((error) => this.deps.Logger.error({ message: "Cleanup hook failed", error, ...this.base }))
      .finally(() => this.exitFn(exitCode));
  }

  applyTo(server: ServerType, cleanup: () => any = tools.noop) {
    process.once("SIGTERM", () => {
      this.deps.Logger.info({ message: "SIGTERM received", ...this.base });
      this.shutdown(server, cleanup, 0);
    });

    process.once("SIGINT", () => {
      this.deps.Logger.info({ message: "SIGINT received", ...this.base });
      this.shutdown(server, cleanup, 0);
    });

    process.once("unhandledRejection", (error) => {
      this.deps.Logger.error({ message: "UnhandledRejection received", error, ...this.base });
      this.shutdown(server, cleanup, 1);
    });

    process.once("uncaughtException", (error) => {
      this.deps.Logger.error({ message: "UncaughtException received", error, ...this.base });
      this.shutdown(server, cleanup, 1);
    });
  }
}
