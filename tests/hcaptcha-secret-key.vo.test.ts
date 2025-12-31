import { describe, expect, test } from "bun:test";
import { HCaptchaSecretKey } from "../src/hcaptcha-secret-key.vo";

describe("HCaptchaSecretKey VO", () => {
  test("happy path", () => {
    expect(HCaptchaSecretKey.safeParse("a".repeat(35)).success).toEqual(true);
    expect(HCaptchaSecretKey.safeParse("A".repeat(35)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => HCaptchaSecretKey.parse(null)).toThrow("hcaptcha.secret.key.type");
  });

  test("rejects non-string - number", () => {
    expect(() => HCaptchaSecretKey.parse(123)).toThrow("hcaptcha.secret.key.type");
  });

  test("rejects empty", () => {
    expect(() => HCaptchaSecretKey.parse("")).toThrow("hcaptcha.secret.key.length");
  });

  test("rejects too long", () => {
    expect(() => HCaptchaSecretKey.parse(`${"a".repeat(35)}a`)).toThrow("hcaptcha.secret.key.length");
  });
});
