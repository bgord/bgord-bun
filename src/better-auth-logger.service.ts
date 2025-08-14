import { Logger, LogLevelEnum } from "./logger.service";

const mapLevel = (level: string) =>
  level === "error"
    ? LogLevelEnum.error
    : level === "warn"
      ? LogLevelEnum.warn
      : level === "http"
        ? LogLevelEnum.info
        : level === "debug"
          ? LogLevelEnum.info
          : LogLevelEnum.info;

export class BetterAuthLogger {
  constructor(private readonly logger: Logger) {}

  attach() {
    return {
      disabled: false,
      level: "debug",
      log: (level: string, message: string, ...args: unknown[]) =>
        this.logger[mapLevel(level)]({
          message,
          operation: "better-auth",
          metadata: { args },
        }),
    };
  }
}
