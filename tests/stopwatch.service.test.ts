import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Stopwatch, StopwatchError } from "../src/stopwatch.service";

describe("Stopwatch", () => {
  test("happy path", () => {
    jest.useFakeTimers();
    const stopwatch = new Stopwatch(tools.Timestamp.fromNumber(Date.now()));
    jest.advanceTimersByTime(tools.Duration.Ms(500).ms);

    expect(stopwatch.stop().ms).toEqual(tools.DurationMs.parse(500));

    jest.useRealTimers();
  });

  test("throws if stop is called twice", () => {
    jest.useFakeTimers();
    const stopwatch = new Stopwatch(tools.Timestamp.fromNumber(Date.now()));

    stopwatch.stop();

    expect(() => stopwatch.stop()).toThrow(StopwatchError.AlreadyStopped);

    jest.useRealTimers();
  });
});
