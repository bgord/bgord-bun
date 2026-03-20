import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { SmsBody } from "../src/sms-body.vo";
import { SmsCollectingAdapter } from "../src/sms-collecting.adapter";
import { SmsMessage } from "../src/sms-message.vo";
import { TelephoneNumber } from "../src/telephone-number.vo";

const to = v.parse(TelephoneNumber, "+12125551234");
const body = v.parse(SmsBody, "Your OTP is 123456");

const adapter = new SmsCollectingAdapter();

describe("SmsCollectingAdapter", () => {
  test("send", async () => {
    const message = new SmsMessage(to, body);

    await adapter.send(message);

    expect(adapter.messages).toEqual([message]);
  });

  test("verify", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
