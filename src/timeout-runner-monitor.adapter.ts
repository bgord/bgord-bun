import type * as tools from "@bgord/tools";
import type { LoggerPort } from "./logger.port";
import type { TimeoutRunnerPort } from "./timeout-runner.port";

type Dependencies = { Logger: LoggerPort };

export class TimeoutRunnerMonitorAdapter implements TimeoutRunnerPort {
  constructor(private readonly deps: Dependencies) {}

  async run<T>(action: Promise<T>, timeout: tools.Duration): Promise<T> {
    const monitor = setTimeout(
      () =>
        this.deps.Logger.warn({
          message: "Timeout",
          component: "infra",
          operation: "timeout_monitor",
          metadata: { timeoutMs: timeout.ms },
        }),
      timeout.ms,
    );

    return action.finally(() => clearTimeout(monitor));
  }
}
