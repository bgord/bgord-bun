import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { RecaptchaSecretKey } from "../src/recaptcha-secret-key.vo";

describe("RecaptchaSecretKey", () => {
  test("happy path", () => {
    expect(v.safeParse(RecaptchaSecretKey, "a".repeat(40)).success).toEqual(true);
    expect(v.safeParse(RecaptchaSecretKey, "A".repeat(40)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(RecaptchaSecretKey, null)).toThrow("recaptcha.secret.key.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(RecaptchaSecretKey, 123)).toThrow("recaptcha.secret.key.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(RecaptchaSecretKey, "")).toThrow("recaptcha.secret.key.length");
  });

  test("rejects too long", () => {
    expect(() => v.parse(RecaptchaSecretKey, `${"a".repeat(40)}a`)).toThrow("recaptcha.secret.key.length");
  });
});
