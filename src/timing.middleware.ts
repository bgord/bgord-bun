import type { ClockPort } from "./clock.port";
import { EventStreamAccept } from "./event-stream-accept.service";
import type { HasRequestHeader } from "./request-context.port";
import { Stopwatch } from "./stopwatch.service";

export type TimingMiddlewareDependencies = { Clock: ClockPort };

export class TimingMiddleware {
  static readonly HEADER_NAME = "Server-Timing";

  constructor(private readonly deps: TimingMiddlewareDependencies) {}

  async measure(context: HasRequestHeader, action: () => void | Promise<void>): Promise<string | null> {
    if (EventStreamAccept.matches(context.request.header("accept"))) return null;

    const stopwatch = new Stopwatch(this.deps);

    await action();

    return `total;dur=${Math.max(0, stopwatch.stop().ms)}`;
  }
}
