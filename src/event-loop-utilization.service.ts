import { performance } from "node:perf_hooks";

// 0.0 – 1.0
export type EventLoopUtilizationSnapshot = number;

export class EventLoopUtilization {
  private static previous: ReturnType<typeof performance.eventLoopUtilization> | null = null;

  static snapshot(): EventLoopUtilizationSnapshot {
    // Stryker disable all
    const current = performance.eventLoopUtilization(EventLoopUtilization.previous ?? undefined);
    // Stryker restore all

    EventLoopUtilization.previous = current;

    return current.utilization;
  }

  // Stryker disable all
  /** @internal */
  static _resetForTest(): void {
    EventLoopUtilization.previous = null;
  }
  // Stryker restore all
}
