import type { ClockPort } from "./clock.port";
import type { RequestContext } from "./request-context.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { Clock: ClockPort };

export class TimingMiddleware {
  static readonly HEADER_NAME = "Server-Timing";

  constructor(private readonly deps: Dependencies) {}

  async measure(context: RequestContext, action: () => void | Promise<void>): Promise<string | null> {
    if (context.request.header("accept")?.toLowerCase().startsWith("text/event-stream")) return null;

    const stopwatch = new Stopwatch(this.deps);

    await action();

    return `total;dur=${stopwatch.stop().ms}`;
  }
}
