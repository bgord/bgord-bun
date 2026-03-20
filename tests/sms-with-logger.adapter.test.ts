import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { SmsNoopAdapter } from "../src/sms-noop.adapter";
import { SmsWithLoggerAdapter } from "../src/sms-with-logger.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const inner = new SmsNoopAdapter();

describe("SmsWithLoggerAdapter", () => {
  test("send - success", async () => {
    using sendSpy = spyOn(inner, "send").mockImplementation(jest.fn());
    const Logger = new LoggerCollectingAdapter();
    const adapter = new SmsWithLoggerAdapter({ Logger, Clock, inner });

    await adapter.send(mocks.sms);

    expect(sendSpy).toHaveBeenCalledWith(mocks.sms);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: "SMS attempt",
        metadata: mocks.sms.toJSON(),
        operation: "sms",
      },
      {
        component: "infra",
        message: "SMS success",
        metadata: { message: mocks.sms.toJSON(), duration: expect.any(tools.Duration) },
        operation: "sms",
      },
    ]);
  });

  test("send - failure", async () => {
    using sendSpy = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalErrorAsync);
    const Logger = new LoggerCollectingAdapter();
    const adapter = new SmsWithLoggerAdapter({ Logger, Clock, inner });

    expect(async () => adapter.send(mocks.sms)).toThrow(mocks.IntentionalError);
    expect(sendSpy).toHaveBeenCalledWith(mocks.sms);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: "SMS attempt",
        metadata: mocks.sms.toJSON(),
        operation: "sms",
      },
      {
        component: "infra",
        message: "SMS error",
        operation: "sms",
        error: new Error(mocks.IntentionalError),
        metadata: expect.any(tools.Duration),
      },
    ]);
  });

  test("verify", async () => {
    using verifySpy = spyOn(inner, "verify").mockImplementation(jest.fn());
    const Logger = new LoggerCollectingAdapter();
    const adapter = new SmsWithLoggerAdapter({ Logger, Clock, inner });

    await adapter.verify();

    expect(verifySpy).toHaveBeenCalled();
  });
});
