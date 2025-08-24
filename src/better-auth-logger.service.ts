import type { LogLevel } from "better-auth";
import { type LoggerPort, LogLevelEnum } from "./logger.port";
import { formatError } from "./logger-format-error.service";

export class BetterAuthLogger {
  constructor(private readonly logger: LoggerPort) {}

  attach() {
    return {
      disabled: false,
      level: "debug",
      log: (lvl: LogLevel | undefined, message: string, ...args: unknown[]) => {
        const level = this.mapLevel(lvl);

        const base = {
          component: "infra",
          operation: "better-auth",
          message,
          metadata: { args },
        } as const;

        switch (level) {
          case LogLevelEnum.error: {
            this.logger.error({
              ...base,
              error: formatError(args.find((a) => a instanceof Error) ?? new Error(message)),
            });
            break;
          }
          case LogLevelEnum.warn: {
            this.logger.warn(base);
            break;
          }
          default: {
            this.logger.info(base);
            break;
          }
        }
      },
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
