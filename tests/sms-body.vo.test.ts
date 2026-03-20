import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { SmsBody, SmsBodyError } from "../src/sms-body.vo";

describe("SmsBody", () => {
  test("happy path", () => {
    expect(v.safeParse(SmsBody, "Your OTP is 123456").success).toEqual(true);
  });

  test("happy path - max length", () => {
    expect(v.safeParse(SmsBody, "a".repeat(640)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(SmsBody, null)).toThrow(SmsBodyError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(SmsBody, 123456)).toThrow(SmsBodyError.Type);
  });

  test("rejects empty", () => {
    expect(() => v.parse(SmsBody, "")).toThrow(SmsBodyError.Empty);
  });

  test("rejects too long", () => {
    expect(() => v.parse(SmsBody, "a".repeat(641))).toThrow(SmsBodyError.TooLong);
  });
});
