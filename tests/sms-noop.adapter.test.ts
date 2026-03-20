import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { SmsBody } from "../src/sms-body.vo";
import { SmsMessage } from "../src/sms-message.vo";
import { SmsNoopAdapter } from "../src/sms-noop.adapter";
import { TelephoneNumber } from "../src/telephone-number.vo";

const to = v.parse(TelephoneNumber, "+12125551234");
const body = v.parse(SmsBody, "Your OTP is 123456");

const adapter = new SmsNoopAdapter();

describe("SmsNoopAdapter", () => {
  test("send", async () => {
    expect(async () => adapter.send(new SmsMessage(to, body))).not.toThrow();
  });

  test("verify", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
