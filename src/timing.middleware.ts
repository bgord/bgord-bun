import type { ClockPort } from "./clock.port";
import type { HasRequestHeader } from "./request-context.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { Clock: ClockPort };

export class TimingMiddleware {
  static readonly HEADER_NAME = "Server-Timing";

  constructor(private readonly deps: Dependencies) {}

  async measure(context: HasRequestHeader, action: () => void | Promise<void>): Promise<string | null> {
    if (TimingMiddleware.isEventStream(context.request.header("accept"))) return null;

    const stopwatch = new Stopwatch(this.deps);

    await action();

    return `total;dur=${Math.max(0, stopwatch.stop().ms)}`;
  }

  private static isEventStream(accept: string | undefined): boolean {
    if (!accept) return false;

    return accept
      .toLowerCase()
      .split(",")
      .some((type) => type.split(";")[0]?.trim() === "text/event-stream");
  }
}
