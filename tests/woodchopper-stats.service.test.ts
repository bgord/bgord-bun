import { describe, expect, test } from "bun:test";
import { WoodchopperStats } from "../src/woodchopper-stats.service";

describe("WoodchopperStats", () => {
  test("recordAccepted", () => {
    const stats = new WoodchopperStats();

    stats.recordAccepted();

    expect(stats.snapshot).toEqual({ accepted: 1, dropped: 0, deliveryFailures: 0 });

    stats.recordAccepted();

    expect(stats.snapshot).toEqual({ accepted: 2, dropped: 0, deliveryFailures: 0 });
  });

  test("recordDropped", () => {
    const stats = new WoodchopperStats();

    stats.recordDropped();

    expect(stats.snapshot).toEqual({ accepted: 0, dropped: 1, deliveryFailures: 0 });

    stats.recordDropped();

    expect(stats.snapshot).toEqual({ accepted: 0, dropped: 2, deliveryFailures: 0 });
  });

  test("recordDeliveryFailure", () => {
    const stats = new WoodchopperStats();

    stats.recordDeliveryFailure();

    expect(stats.snapshot).toEqual({ accepted: 0, dropped: 0, deliveryFailures: 1 });

    stats.recordDeliveryFailure();

    expect(stats.snapshot).toEqual({ accepted: 0, dropped: 0, deliveryFailures: 2 });
  });
});
