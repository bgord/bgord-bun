import { describe, expect, test } from "bun:test";
import { WoodchopperStats } from "../src/woodchopper-stats.service";

describe("WoodchopperStats", () => {
  test("recordWritten", () => {
    const stats = new WoodchopperStats();

    stats.recordWritten();

    expect(stats.snapshot).toEqual({ written: 1, dropped: 0, deliveryFailures: 0 });

    stats.recordWritten();

    expect(stats.snapshot).toEqual({ written: 2, dropped: 0, deliveryFailures: 0 });
  });

  test("recordDropped", () => {
    const stats = new WoodchopperStats();

    stats.recordDropped();

    expect(stats.snapshot).toEqual({ written: 0, dropped: 1, deliveryFailures: 0 });

    stats.recordDropped();

    expect(stats.snapshot).toEqual({ written: 0, dropped: 2, deliveryFailures: 0 });
  });
});
