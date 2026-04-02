import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { AlertChannelNoopAdapter } from "../src/alert-channel-noop.adapter";
import { AlertChannelWithLoggerAdapter } from "../src/alert-channel-with-logger.adapter";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

const inner = new AlertChannelNoopAdapter();

describe("AlertChannelWithLoggerAdapter", () => {
  test("send - success", async () => {
    const Logger = new LoggerCollectingAdapter();
    const adapter = new AlertChannelWithLoggerAdapter({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () => adapter.send(mocks.alert));

    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "alert_channel",
        message: "Alert channel attempt",
        correlationId: mocks.correlationId,
        metadata: mocks.alert.toJSON(),
      },
      {
        component: "infra",
        operation: "alert_channel",
        message: "Alert channel success",
        correlationId: mocks.correlationId,
        metadata: { alert: mocks.alert.toJSON(), duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("send - failure", async () => {
    using _ = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalErrorAsync);
    const Logger = new LoggerCollectingAdapter();
    const adapter = new AlertChannelWithLoggerAdapter({ inner, Logger, Clock });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () => adapter.send(mocks.alert)),
    ).toThrow(mocks.IntentionalError);

    expect(Logger.entries[0]).toEqual({
      component: "infra",
      operation: "alert_channel",
      message: "Alert channel attempt",
      correlationId: mocks.correlationId,
      metadata: mocks.alert.toJSON(),
    });
    expect(Logger.entries[1]).toEqual({
      component: "infra",
      operation: "alert_channel",
      message: "Alert channel error",
      correlationId: mocks.correlationId,
      error: new Error(mocks.IntentionalError),
      metadata: { alert: mocks.alert, duration: expect.any(tools.Duration) },
    });
  });

  test("verify", async () => {
    const Logger = new LoggerCollectingAdapter();
    const adapter = new AlertChannelWithLoggerAdapter({ inner, Logger, Clock });

    expect(await adapter.verify()).toEqual(true);
  });
});
