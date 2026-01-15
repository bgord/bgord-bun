import perf_hooks from "perf_hooks";
import * as tools from "@bgord/tools";

export type EventLoopLagSnapshotType = { p50: tools.Duration; p95: tools.Duration; p99: tools.Duration };

export const EventLoopLagErorr = { NotStarted: "event.loop.lag.not.started" };

export class EventLoopLag {
  private static histogram: ReturnType<typeof perf_hooks.monitorEventLoopDelay> | null = null;

  static start(resolution: tools.Duration = tools.Duration.Ms(20)): void {
    if (EventLoopLag.histogram) return;

    EventLoopLag.histogram = perf_hooks.monitorEventLoopDelay({ resolution: resolution.ms });
    EventLoopLag.histogram.enable();
  }

  static snapshot(): EventLoopLagSnapshotType {
    if (!EventLoopLag.histogram) throw new Error(EventLoopLagErorr.NotStarted);

    return {
      p50: tools.Duration.Ns(EventLoopLag.histogram.percentile(50)),
      p95: tools.Duration.Ns(EventLoopLag.histogram.percentile(95)),
      p99: tools.Duration.Ns(EventLoopLag.histogram.percentile(99)),
    };
  }

  /** @internal TEST ONLY */
  static _resetForTest(): void {
    EventLoopLag.histogram = null;
  }
}
