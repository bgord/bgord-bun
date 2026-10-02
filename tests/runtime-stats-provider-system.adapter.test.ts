import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { EventLoopLag } from "../src/event-loop-lag.service";
import { EventLoopUtilization } from "../src/event-loop-utilization.service";
import { InFlightRequestsTracker } from "../src/in-flight-requests-tracker.service";
import { MemoryConsumption } from "../src/memory-consumption.service";
import { RuntimeStatsProviderSystemAdapter } from "../src/runtime-stats-provider-system.adapter";
import { Uptime } from "../src/uptime.service";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("RuntimeStatsProviderSystemAdapter", () => {
  test("constructor - starts event loop lag", () => {
    using start = spyOn(EventLoopLag, "start").mockImplementation(() => {});

    new RuntimeStatsProviderSystemAdapter({ Clock });

    expect(start).toHaveBeenCalledTimes(1);
  });

  test("getStats", () => {
    using spies = new DisposableStack();
    spies.use(spyOn(EventLoopLag, "start").mockImplementation(() => {}));
    spies.use(spyOn(EventLoopLag, "snapshot").mockReturnValue(mocks.eventLoopLag));
    spies.use(spyOn(EventLoopUtilization, "snapshot").mockReturnValue(mocks.eventLoopUtilization));
    spies.use(spyOn(MemoryConsumption, "snapshot").mockReturnValue(mocks.memoryConsumption));
    spies.use(spyOn(InFlightRequestsTracker, "get").mockReturnValue(mocks.inFlightRequests));
    const uptimeGet = spies.use(spyOn(Uptime, "get").mockReturnValue(mocks.uptime));
    const adapter = new RuntimeStatsProviderSystemAdapter({ Clock });

    const result = adapter.getStats();

    expect(result).toEqual(mocks.runtimeStats);
    expect(uptimeGet).toHaveBeenCalledWith(Clock);
  });
});
