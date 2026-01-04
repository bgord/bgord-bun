import { describe, expect, spyOn, test } from "bun:test";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { Instrumentation } from "../src/instrumentation.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

const label = "calculator";

const Logger = new LoggerNoopAdapter();
const Clock = new ClockSystemAdapter();
const deps = { Logger, Clock };

const service = new Instrumentation(deps);

describe("Instrumentation", () => {
  test("measure", async () => {
    const loggerInfo = spyOn(Logger, "info");

    const result = service.measure(label, () => 1);

    expect(result).toEqual(1);
    expect(loggerInfo).toHaveBeenCalledWith({
      message: `${label} measurement`,
      component: "infra",
      operation: "instrumentation_measure",
      metadata: { durationMs: expect.any(Number) },
    });
  });

  test("measure - error propagation", async () => {
    const loggerInfo = spyOn(Logger, "info");

    expect(() => service.measure(label, mocks.throwIntentionalError)).toThrow(mocks.IntentionalError);
    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("measureAsync", async () => {
    const loggerInfo = spyOn(Logger, "info");

    const result = await service.measureAsync(label, () => 1);

    expect(result).toEqual(1);
    expect(loggerInfo).toHaveBeenCalledWith({
      message: `${label} measurement`,
      component: "infra",
      operation: "instrumentation_measure",
      metadata: { durationMs: expect.any(Number) },
    });
  });

  test("measureAsync - error propagation", async () => {
    const loggerInfo = spyOn(Logger, "info");

    expect(async () => service.measureAsync(label, mocks.throwIntentionalErrorAsync)).toThrow(
      mocks.IntentionalError,
    );
    expect(loggerInfo).not.toHaveBeenCalled();
  });
});
