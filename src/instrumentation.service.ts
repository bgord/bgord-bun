import type { ClockPort } from "./clock.port";
import type { LoggerPort } from "./logger.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

export class Instrumentation {
  constructor(private readonly deps: Dependencies) {}

  measure<T>(label: string, action: () => T): T {
    const stopwatch = new Stopwatch(this.deps);

    const result = action();

    this.deps.Logger.info({
      message: `${label} measurement`,
      component: "infra",
      operation: "instrumentation_measure",
      metadata: stopwatch.stop(),
    });

    return result;
  }

  async measureAsync<T>(label: string, action: () => T): Promise<T> {
    const stopwatch = new Stopwatch(this.deps);

    const result = await action();

    this.deps.Logger.info({
      message: `${label} measurement`,
      component: "infra",
      operation: "instrumentation_measure",
      metadata: stopwatch.stop(),
    });

    return result;
  }
}
