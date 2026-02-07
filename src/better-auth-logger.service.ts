import { type LoggerPort, LogLevelEnum } from "./logger.port";

type LogLevel = "info" | "success" | "warn" | "error" | "debug";

type Dependencies = { Logger: LoggerPort };

export class BetterAuthLogger {
  constructor(private readonly deps: Dependencies) {}

  attach() {
    return {
      disabled: false,
      level: "debug",
      log: (lvl: LogLevel | undefined, message: string, ...args: ReadonlyArray<unknown>) => {
        const level = this.mapLevel(lvl);
        const base = { component: "infra", operation: "better-auth", message, metadata: { args } } as const;

        switch (level) {
          case LogLevelEnum.error: {
            this.deps.Logger.error({
              ...base,
              error: args.find((arg) => arg instanceof Error) ?? new Error(message),
            });
            break;
          }
          case LogLevelEnum.warn: {
            this.deps.Logger.warn(base);
            break;
          }
          default: {
            this.deps.Logger.info(base);
            break;
          }
        }
      },
    } as const;
  }

  private mapLevel(level: LogLevel | undefined) {
    if (level === "warn") return LogLevelEnum.warn;
    if (level === "error") return LogLevelEnum.error;
    return LogLevelEnum.info;
  }
}
