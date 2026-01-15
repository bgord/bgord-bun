import { describe, expect, spyOn, test } from "bun:test";
import perf_hooks from "perf_hooks";
import * as tools from "@bgord/tools";
import { EventLoopLag } from "../src/event-loop-lag.service";

const histogram = {
  enable: () => {},
  percentile: (value: number) => {
    if (value === 50) return 1_000_000;
    if (value === 95) return 5_000_000;
    if (value === 99) return 9_000_000;
    return 0;
  },
} as any;

describe("EventLoopLag service", () => {
  test("start - idempotency", () => {
    const monitorEventLoopDelay = spyOn(perf_hooks, "monitorEventLoopDelay").mockReturnValue(histogram);
    EventLoopLag._resetForTest();

    EventLoopLag.start();
    EventLoopLag.start();
    EventLoopLag.start();

    expect(monitorEventLoopDelay).toHaveBeenCalledTimes(1);
  });

  test("start - custom resolution", () => {
    const monitorEventLoopDelay = spyOn(perf_hooks, "monitorEventLoopDelay").mockReturnValue(histogram);
    EventLoopLag._resetForTest();

    EventLoopLag.start(tools.Duration.Ms(40));

    expect(monitorEventLoopDelay).toHaveBeenCalledWith({ resolution: 40 });
  });

  test("snapshot", () => {
    spyOn(perf_hooks, "monitorEventLoopDelay").mockReturnValue(histogram);
    EventLoopLag._resetForTest();
    EventLoopLag.start();

    const snapshot = EventLoopLag.snapshot();

    expect(snapshot.p50.equals(tools.Duration.Ms(1))).toEqual(true);
    expect(snapshot.p95.equals(tools.Duration.Ms(5))).toEqual(true);
    expect(snapshot.p99.equals(tools.Duration.Ms(9))).toEqual(true);
  });

  test("snapshot - not started", () => {
    EventLoopLag._resetForTest();

    expect(() => EventLoopLag.snapshot()).toThrow("event.loop.lag.not.started");
  });
});
