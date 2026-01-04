import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { Stopwatch } from "../src/stopwatch.service";
import * as mocks from "./mocks";

describe("Stopwatch", () => {
  test("happy path", () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const duration = tools.Duration.Seconds(5);
    const stopwatch = new Stopwatch({ Clock });

    Clock.advanceBy(duration);
    const result = stopwatch.stop();

    expect(result).toEqual(duration);
  });

  test("already stopped", () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const stopwatch = new Stopwatch({ Clock });

    stopwatch.stop();
    expect(() => stopwatch.stop()).toThrow("stopwatch.already.stopped");
  });
});
