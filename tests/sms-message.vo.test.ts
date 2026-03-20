import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { SmsBody } from "../src/sms-body.vo";
import { SmsMessage } from "../src/sms-message.vo";
import { TelephoneNumber } from "../src/telephone-number.vo";

const to = v.parse(TelephoneNumber, "+12125551234");
const from = v.parse(TelephoneNumber, "+48600123456");
const body = v.parse(SmsBody, "Your OTP is 123456");

describe("SmsMessage", () => {
  test("happy path - without sender", () => {
    const message = new SmsMessage(to, body);

    expect(message.to).toEqual(to);
    expect(message.body).toEqual(body);
    expect(message.from).toEqual(undefined);
  });

  test("happy path - with sender", () => {
    const message = new SmsMessage(to, body, from);

    expect(message.to).toEqual(to);
    expect(message.body).toEqual(body);
    expect(message.from).toEqual(from);
  });

  test("toJSON - without sender", () => {
    const message = new SmsMessage(to, body);

    expect(message.toJSON()).toEqual({ to, body, from: undefined });
  });

  test("toJSON - with sender", () => {
    const message = new SmsMessage(to, body, from);

    expect(message.toJSON()).toEqual({ to, from, body });
  });
});
