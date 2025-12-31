import { describe, expect, test } from "bun:test";
import { RecaptchaSecretKey } from "../src/recaptcha-secret-key.vo";

describe("RecaptchaSiteKey VO", () => {
  test("happy path", () => {
    expect(RecaptchaSecretKey.safeParse("a".repeat(40)).success).toEqual(true);
    expect(RecaptchaSecretKey.safeParse("A".repeat(40)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => RecaptchaSecretKey.parse(null)).toThrow("recaptcha.secret.key.type");
  });

  test("rejects non-string - number", () => {
    expect(() => RecaptchaSecretKey.parse(123)).toThrow("recaptcha.secret.key.type");
  });

  test("rejects empty", () => {
    expect(() => RecaptchaSecretKey.parse("")).toThrow("recaptcha.secret.key.length");
  });

  test("rejects too long", () => {
    expect(() => RecaptchaSecretKey.parse(`${"a".repeat(40)}a`)).toThrow("recaptcha.secret.key.length");
  });
});
