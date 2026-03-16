import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { HCaptchaSecretKey } from "../src/hcaptcha-secret-key.vo";

describe("HCaptchaSecretKey", () => {
  test("happy path", () => {
    expect(v.safeParse(HCaptchaSecretKey, "a".repeat(35)).success).toEqual(true);
    expect(v.safeParse(HCaptchaSecretKey, "A".repeat(35)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(HCaptchaSecretKey, null)).toThrow("hcaptcha.secret.key.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(HCaptchaSecretKey, 123)).toThrow("hcaptcha.secret.key.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(HCaptchaSecretKey, "")).toThrow("hcaptcha.secret.key.length");
  });

  test("rejects too long", () => {
    expect(() => v.parse(HCaptchaSecretKey, `${"a".repeat(35)}a`)).toThrow("hcaptcha.secret.key.length");
  });
});
