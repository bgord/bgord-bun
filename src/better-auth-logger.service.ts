import type { LogLevel } from "better-auth";
import { Logger, LogLevelEnum } from "./logger.service";

export class BetterAuthLogger {
  constructor(private readonly logger: Logger) {}

  attach() {
    return {
      disabled: false,
      level: "debug",
      log: (level: LogLevel | undefined, message: string, ...args: unknown[]) =>
        this.logger[this.mapLevel(level)]({
          message,
          operation: "better-auth",
          metadata: { args },
        }),
    } as const;
  }

  private mapLevel(level: LogLevel | undefined) {
    if (level === "info") return LogLevelEnum.info;
    if (level === "success") return LogLevelEnum.info;
    if (level === "warn") return LogLevelEnum.warn;
    if (level === "error") return LogLevelEnum.error;
    if (level === "debug") return LogLevelEnum.info;
    return LogLevelEnum.info;
  }
}
