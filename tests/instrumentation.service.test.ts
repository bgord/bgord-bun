import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { Instrumentation } from "../src/instrumentation.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

const label = "calculator";

const Clock = new ClockSystemAdapter();

describe("Instrumentation", () => {
  test("measure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const service = new Instrumentation({ Clock, Logger });

    const result = CorrelationStorage.run(mocks.correlationId, () => service.measure(label, () => 1));

    expect(result).toEqual(1);
    expect(Logger.entries).toEqual([
      {
        message: `${label} measurement`,
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "instrumentation_measure",
        metadata: { duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("measure - error propagation", async () => {
    const Logger = new LoggerCollectingAdapter();
    const service = new Instrumentation({ Clock, Logger });

    expect(() =>
      CorrelationStorage.run(mocks.correlationId, () => service.measure(label, mocks.throwIntentionalError)),
    ).toThrow(mocks.IntentionalError);
    expect(Logger.entries.length).toEqual(0);
  });

  test("measureAsync", async () => {
    const Logger = new LoggerCollectingAdapter();
    const service = new Instrumentation({ Clock, Logger });

    const result = await CorrelationStorage.run(mocks.correlationId, async () =>
      service.measureAsync(label, () => 1),
    );

    expect(result).toEqual(1);
    expect(Logger.entries).toEqual([
      {
        message: `${label} measurement`,
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "instrumentation_measure",
        metadata: { duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("measureAsync - error propagation", async () => {
    const Logger = new LoggerCollectingAdapter();
    const service = new Instrumentation({ Clock, Logger });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () =>
        service.measureAsync(label, mocks.throwIntentionalErrorAsync),
      ),
    ).toThrow(mocks.IntentionalError);
    expect(Logger.entries.length).toEqual(0);
  });
});
