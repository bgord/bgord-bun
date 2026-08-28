import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { SmsNoopAdapter } from "../src/sms-noop.adapter";
import { SmsWithLoggerAdapter } from "../src/sms-with-logger.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("SmsWithLoggerAdapter", () => {
  test("send - success", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new SmsNoopAdapter();
    using sendSpy = spyOn(inner, "send").mockImplementation(jest.fn());
    const adapter = new SmsWithLoggerAdapter({ Logger, Clock, inner });

    await CorrelationStorage.run(mocks.correlationId, async () => adapter.send(mocks.sms));

    expect(sendSpy).toHaveBeenCalledWith(mocks.sms);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: "SMS attempt",
        correlationId: mocks.correlationId,
        metadata: { message: mocks.sms.toJSON() },
        operation: "sms",
      },
      {
        component: "infra",
        message: "SMS success",
        correlationId: mocks.correlationId,
        metadata: { message: mocks.sms.toJSON(), duration: expect.any(tools.Duration) },
        operation: "sms",
      },
    ]);
  });

  test("send - failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new SmsNoopAdapter();
    using sendSpy = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new SmsWithLoggerAdapter({ Logger, Clock, inner });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () => adapter.send(mocks.sms)),
    ).toThrow(mocks.IntentionalError);
    expect(sendSpy).toHaveBeenCalledWith(mocks.sms);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: "SMS attempt",
        correlationId: mocks.correlationId,
        metadata: { message: mocks.sms.toJSON() },
        operation: "sms",
      },
      {
        component: "infra",
        message: "SMS error",
        correlationId: mocks.correlationId,
        operation: "sms",
        error: new Error(mocks.IntentionalError),
        metadata: { message: mocks.sms.toJSON(), duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("verify", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new SmsNoopAdapter();
    const adapter = new SmsWithLoggerAdapter({ Logger, Clock, inner });

    expect(await adapter.verify()).toEqual(true);
    expect(Logger.entries).toEqual([]);
  });
});
