import { describe, expect, test } from "bun:test";
import { HCaptchaSiteKey, HCaptchaSiteKeyError } from "../src/hcaptcha-site-key.vo";

describe("HCaptchaSiteKey", () => {
  test("happy path", () => {
    expect(HCaptchaSiteKey.safeParse("a".repeat(36)).success).toEqual(true);
    expect(HCaptchaSiteKey.safeParse("A".repeat(36)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => HCaptchaSiteKey.parse(null)).toThrow(HCaptchaSiteKeyError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => HCaptchaSiteKey.parse(123)).toThrow(HCaptchaSiteKeyError.Type);
  });

  test("rejects empty", () => {
    expect(() => HCaptchaSiteKey.parse("")).toThrow(HCaptchaSiteKeyError.Length);
  });

  test("rejects too long", () => {
    expect(() => HCaptchaSiteKey.parse(`${"a".repeat(36)}a`)).toThrow(HCaptchaSiteKeyError.Length);
  });
});
