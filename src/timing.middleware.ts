import type { ClockPort } from "./clock.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { Clock: ClockPort };

export class TimingMiddleware {
  static readonly HEADER_NAME = "Server-Timing";

  constructor(private readonly deps: Dependencies) {}

  async measure(action: () => void | Promise<void>): Promise<string> {
    const stopwatch = new Stopwatch(this.deps);

    await action();

    return `total;dur=${stopwatch.stop().ms}`;
  }
}
