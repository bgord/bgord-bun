import { describe, expect, spyOn, test } from "bun:test";
import { performance } from "node:perf_hooks";
import { EventLoopUtilization } from "../src/event-loop-utilization.service";

describe("EventLoopUtilization service", () => {
  test("snapshot - no history", () => {
    spyOn(performance, "eventLoopUtilization").mockReturnValue({
      utilization: 0.4,
    } as any);
    EventLoopUtilization._resetForTest();

    const value = EventLoopUtilization.snapshot();

    expect(value).toEqual(0.4);
  });

  test("snapshot - history", () => {
    const eventLoopUtilization = spyOn(performance, "eventLoopUtilization")
      .mockReturnValueOnce({ utilization: 0.1 } as any)
      .mockReturnValueOnce({ utilization: 0.7 } as any);
    EventLoopUtilization._resetForTest();

    expect(EventLoopUtilization.snapshot()).toEqual(0.1);
    expect(EventLoopUtilization.snapshot()).toEqual(0.7);

    expect(eventLoopUtilization).toHaveBeenCalledTimes(2);
  });
});
