import { describe, expect, test } from "bun:test";
import { HCaptchaSecretKey, HCaptchaSecretKeyError } from "../src/hcaptcha-secret-key.vo";

describe("HCaptchaSecretKey VO", () => {
  test("happy path", () => {
    expect(HCaptchaSecretKey.safeParse("a".repeat(35)).success).toEqual(true);
    expect(HCaptchaSecretKey.safeParse("A".repeat(35)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => HCaptchaSecretKey.parse(null)).toThrow(HCaptchaSecretKeyError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => HCaptchaSecretKey.parse(123)).toThrow(HCaptchaSecretKeyError.Type);
  });

  test("rejects empty", () => {
    expect(() => HCaptchaSecretKey.parse("")).toThrow(HCaptchaSecretKeyError.Length);
  });

  test("rejects too long", () => {
    expect(() => HCaptchaSecretKey.parse(`${"a".repeat(35)}a`)).toThrow(HCaptchaSecretKeyError.Length);
  });
});
