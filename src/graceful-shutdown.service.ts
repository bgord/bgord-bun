import * as tools from "@bgord/tools";
import type { LoggerPort } from "./logger.port";

export type ServerType = ReturnType<typeof Bun.serve>;

type Dependencies = { Logger: LoggerPort };
type Config = { cleanup: () => Promise<void> | void; exit?: (code: number) => never };

export class GracefulShutdown {
  private readonly base = { operation: "shutdown", component: "infra" } as const;
  private isShuttingDown = false;

  constructor(
    private readonly deps: Dependencies,
    private readonly config: Config = { cleanup: tools.noop, exit: process.exit },
  ) {}

  private async shutdown(server: ServerType, exitCode: number) {
    // Stryker disable all
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    // Stryker restore all

    try {
      server.stop();
    } catch (error) {
      this.deps.Logger.error({ message: "Server stop failed", error, ...this.base });
    }

    try {
      await this.config.cleanup();
      this.deps.Logger.info({ message: "HTTP server closed", ...this.base });
    } catch (error) {
      this.deps.Logger.error({ message: "Cleanup hook failed", error, ...this.base });
    } finally {
      this.config.exit?.(exitCode);
    }
  }

  applyTo(server: ServerType) {
    const graceful = (signal: string) => () => {
      this.deps.Logger.info({ message: `${signal} received`, ...this.base });
      this.shutdown(server, 0);
    };

    const fatal = (event: string) => (error: unknown) => {
      this.deps.Logger.error({ message: `${event} received`, error, ...this.base });
      this.shutdown(server, 1);
    };

    process.once("SIGTERM", graceful("SIGTERM"));
    process.once("SIGINT", graceful("SIGINT"));
    process.once("unhandledRejection", fatal("UnhandledRejection"));
    process.once("uncaughtException", fatal("UncaughtException"));
  }
}
