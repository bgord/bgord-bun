import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { SmsBody } from "../src/sms-body.vo";
import { SmsMessage } from "../src/sms-message.vo";
import { SmsNoopAdapter } from "../src/sms-noop.adapter";
import { SmsWithLoggerAdapter } from "../src/sms-with-logger.adapter";
import { TelephoneNumber } from "../src/telephone-number.vo";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const inner = new SmsNoopAdapter();

const to = v.parse(TelephoneNumber, "+12125551234");
const body = v.parse(SmsBody, "Your OTP is 123456");
const message = new SmsMessage(to, body);

describe("SmsWithLoggerAdapter", () => {
  test("send - success", async () => {
    using sendSpy = spyOn(inner, "send").mockImplementation(jest.fn());
    const Logger = new LoggerCollectingAdapter();
    const adapter = new SmsWithLoggerAdapter({ Logger, Clock, inner });

    await adapter.send(message);

    expect(sendSpy).toHaveBeenCalledWith(message);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: "SMS attempt",
        metadata: message.toJSON(),
        operation: "sms",
      },
      {
        component: "infra",
        message: "SMS success",
        metadata: { message: message.toJSON(), duration: expect.any(tools.Duration) },
        operation: "sms",
      },
    ]);
  });

  test("send - failure", async () => {
    using sendSpy = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalErrorAsync);
    const Logger = new LoggerCollectingAdapter();
    const adapter = new SmsWithLoggerAdapter({ Logger, Clock, inner });

    expect(async () => adapter.send(message)).toThrow(mocks.IntentionalError);
    expect(sendSpy).toHaveBeenCalledWith(message);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: "SMS attempt",
        metadata: message.toJSON(),
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
