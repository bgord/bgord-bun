// [BUN DEPENDENCY]
import * as tools from "@bgord/tools";
import type { LoggerPort } from "./logger.port";

export type ServerType = ReturnType<typeof Bun.serve>;

type Dependencies = { Logger: LoggerPort };
type Config = {
  cleanup: () => Promise<void> | void;
  exit?: (code: number) => never;
  grace?: tools.Duration;
};

export class GracefulShutdown {
  private static readonly DEFAULT_GRACE = tools.Duration.Seconds(5);

  private readonly base = { operation: "shutdown", component: "infra" } as const;
  private isShuttingDown = false;

  constructor(
    private readonly deps: Dependencies,
    private readonly config: Config = { cleanup: tools.noop },
  ) {}

  private async shutdown(server: ServerType, exitCode: number) {
    // Stryker disable all
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    // Stryker restore all

    try {
      await this.stop(server);
    } catch (error) {
      this.deps.Logger.error({ message: "Server stop failed", error, ...this.base });
    }

    try {
      await this.config.cleanup();
      this.deps.Logger.info({ message: "HTTP server closed", ...this.base });
    } catch (error) {
      this.deps.Logger.error({ message: "Cleanup hook failed", error, ...this.base });
    } finally {
      this.deps.Logger.close();

      (this.config.exit ?? process.exit)(exitCode);
    }
  }

  // Open streams (SSE) never finish on their own, so a graceful stop is closed by force after the grace
  private async stop(server: ServerType) {
    const stopped = server.stop();

    let deadline: ReturnType<typeof setTimeout> | undefined;
    const exceeded = new Promise<"exceeded">((resolve) => {
      deadline = setTimeout(
        () => resolve("exceeded"),
        (this.config.grace ?? GracefulShutdown.DEFAULT_GRACE).ms,
      );
    });

    const outcome = await Promise.race([stopped, exceeded]);
    clearTimeout(deadline);

    if (outcome !== "exceeded") return;

    this.deps.Logger.warn({ message: "Server stop grace exceeded", ...this.base });
    await server.stop(true);
  }

  applyTo(server: ServerType) {
    const graceful = (signal: string) => async () => {
      this.deps.Logger.info({ message: `${signal} received`, ...this.base });
      await this.shutdown(server, 0);
    };

    const fatal = (event: string) => async (error: unknown) => {
      this.deps.Logger.error({ message: `${event} received`, error, ...this.base });
      await this.shutdown(server, 1);
    };

    process.once("SIGTERM", graceful("SIGTERM"));
    process.once("SIGINT", graceful("SIGINT"));
    process.on("unhandledRejection", fatal("UnhandledRejection"));
    process.on("uncaughtException", fatal("UncaughtException"));
  }
}
