import { describe, expect, test } from "bun:test";
import { RecaptchaSecretKey, RecaptchaSecretKeyError } from "../src/recaptcha-secret-key.vo";

describe("RecaptchaSiteKey VO", () => {
  test("happy path", () => {
    expect(RecaptchaSecretKey.safeParse("a".repeat(40)).success).toEqual(true);
    expect(RecaptchaSecretKey.safeParse("A".repeat(40)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => RecaptchaSecretKey.parse(null)).toThrow(RecaptchaSecretKeyError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => RecaptchaSecretKey.parse(123)).toThrow(RecaptchaSecretKeyError.Type);
  });

  test("rejects empty", () => {
    expect(() => RecaptchaSecretKey.parse("")).toThrow(RecaptchaSecretKeyError.Length);
  });

  test("rejects too long", () => {
    expect(() => RecaptchaSecretKey.parse(`${"a".repeat(40)}a`)).toThrow(RecaptchaSecretKeyError.Length);
  });
});
