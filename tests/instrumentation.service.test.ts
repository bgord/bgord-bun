import { describe, expect, test } from "bun:test";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { Instrumentation } from "../src/instrumentation.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

const label = "calculator";

const Clock = new ClockSystemAdapter();

describe("Instrumentation", () => {
  test("measure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const service = new Instrumentation({ Clock, Logger });

    const result = service.measure(label, () => 1);

    expect(result).toEqual(1);
    expect(Logger.entries).toEqual([
      {
        message: `${label} measurement`,
        component: "infra",
        operation: "instrumentation_measure",
        metadata: { durationMs: expect.any(Number) },
      },
    ]);
  });

  test("measure - error propagation", async () => {
    const Logger = new LoggerCollectingAdapter();
    const service = new Instrumentation({ Clock, Logger });

    expect(() => service.measure(label, mocks.throwIntentionalError)).toThrow(mocks.IntentionalError);
    expect(Logger.entries.length).toEqual(0);
  });

  test("measureAsync", async () => {
    const Logger = new LoggerCollectingAdapter();
    const service = new Instrumentation({ Clock, Logger });

    const result = await service.measureAsync(label, () => 1);

    expect(result).toEqual(1);
    expect(Logger.entries).toEqual([
      {
        message: `${label} measurement`,
        component: "infra",
        operation: "instrumentation_measure",
        metadata: { durationMs: expect.any(Number) },
      },
    ]);
  });

  test("measureAsync - error propagation", async () => {
    const Logger = new LoggerCollectingAdapter();
    const service = new Instrumentation({ Clock, Logger });

    expect(async () => service.measureAsync(label, mocks.throwIntentionalErrorAsync)).toThrow(
      mocks.IntentionalError,
    );
    expect(Logger.entries.length).toEqual(0);
  });
});
