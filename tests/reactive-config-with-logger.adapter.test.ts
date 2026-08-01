import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { ReactiveConfigNoopAdapter } from "../src/reactive-config-noop.adapter";
import { ReactiveConfigWithLoggerAdapter } from "../src/reactive-config-with-logger.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const schema = v.object({ rate: v.number("rate.invalid") });
const config = { rate: 100 };

describe("ReactiveConfigWithLoggerAdapter", () => {
  test("get - success", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new ReactiveConfigNoopAdapter(schema, config);
    const adapter = new ReactiveConfigWithLoggerAdapter({ inner, Logger, Clock });

    expect(await CorrelationStorage.run(mocks.correlationId, async () => adapter.get())).toEqual(config);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "reactive_config",
        message: "Reactive config read attempt",
        correlationId: mocks.correlationId,
      },
      {
        component: "infra",
        operation: "reactive_config",
        message: "Reactive config read success",
        correlationId: mocks.correlationId,
        metadata: { duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("get - failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new ReactiveConfigNoopAdapter(schema, config);
    using _ = spyOn(inner, "get").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new ReactiveConfigWithLoggerAdapter({ inner, Logger, Clock });

    expect(async () => CorrelationStorage.run(mocks.correlationId, async () => adapter.get())).toThrow(
      mocks.IntentionalError,
    );
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "reactive_config",
        message: "Reactive config read attempt",
        correlationId: mocks.correlationId,
      },
      {
        component: "infra",
        operation: "reactive_config",
        message: "Reactive config read error",
        correlationId: mocks.correlationId,
        error: new Error(mocks.IntentionalError),
        metadata: expect.any(tools.Duration),
      },
    ]);
  });
});
