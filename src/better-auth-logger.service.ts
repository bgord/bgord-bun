import type { LoggerPort } from "./logger.port";

type LogLevel = "info" | "success" | "warn" | "error" | "debug";

type Dependencies = { Logger: LoggerPort };

export class BetterAuthLogger {
  constructor(private readonly deps: Dependencies) {}

  attach() {
    return {
      disabled: false,
      level: "debug",
      log: (level: LogLevel | undefined, message: string, ...params: ReadonlyArray<unknown>) => {
        const entry = {
          component: "infra",
          operation: "better-auth",
          message,
          metadata: { params },
        } as const;

        if (level === "error") {
          this.deps.Logger.error({
            ...entry,
            error: params.find((param) => param instanceof Error) ?? new Error(message),
          });
        } else if (level === "warn") {
          this.deps.Logger.warn(entry);
        } else if (level === "debug") {
          this.deps.Logger.debug(entry);
        } else {
          this.deps.Logger.info(entry);
        }
      },
    } as const;
  }
}
