import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { HCaptchaSecretKey } from "../src/hcaptcha-secret-key.vo";

describe("HCaptchaSecretKey", () => {
  test("happy path - standard", () => {
    expect(v.safeParse(HCaptchaSecretKey, "0x" + "a".repeat(40)).success).toEqual(true);
    expect(v.safeParse(HCaptchaSecretKey, "0x" + "A".repeat(40)).success).toEqual(true);
  });

  test("happy path - enterprise", () => {
    expect(v.safeParse(HCaptchaSecretKey, "ES_" + "a".repeat(32)).success).toEqual(true);
    expect(v.safeParse(HCaptchaSecretKey, "ES_" + "A".repeat(32)).success).toEqual(true);
  });

  test("happy path - test key", () => {
    expect(v.safeParse(HCaptchaSecretKey, "0x" + "0".repeat(40)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(HCaptchaSecretKey, null)).toThrow("hcaptcha.secret.key.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(HCaptchaSecretKey, 123)).toThrow("hcaptcha.secret.key.type");
  });

  test("rejects invalid format - no prefix", () => {
    expect(() => v.parse(HCaptchaSecretKey, "a".repeat(40))).toThrow("hcaptcha.secret.key.invalid.format");
  });

  test("rejects invalid format - wrong prefix", () => {
    expect(() => v.parse(HCaptchaSecretKey, "0X" + "a".repeat(40))).toThrow(
      "hcaptcha.secret.key.invalid.format",
    );
  });

  test("rejects invalid format - standard too short", () => {
    expect(() => v.parse(HCaptchaSecretKey, "0x" + "a".repeat(39))).toThrow(
      "hcaptcha.secret.key.invalid.format",
    );
  });

  test("rejects invalid format - standard too long", () => {
    expect(() => v.parse(HCaptchaSecretKey, "0x" + "a".repeat(41))).toThrow(
      "hcaptcha.secret.key.invalid.format",
    );
  });

  test("rejects invalid format - enterprise too short", () => {
    expect(() => v.parse(HCaptchaSecretKey, "ES_" + "a".repeat(31))).toThrow(
      "hcaptcha.secret.key.invalid.format",
    );
  });

  test("rejects invalid format - enterprise too long", () => {
    expect(() => v.parse(HCaptchaSecretKey, "ES_" + "a".repeat(33))).toThrow(
      "hcaptcha.secret.key.invalid.format",
    );
  });

  test("rejects non-hex characters", () => {
    expect(() => v.parse(HCaptchaSecretKey, "0x" + "g".repeat(40))).toThrow(
      "hcaptcha.secret.key.invalid.format",
    );
  });
});
