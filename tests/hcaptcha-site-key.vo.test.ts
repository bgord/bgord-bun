import { describe, expect, test } from "bun:test";
import { HCaptchaSiteKey } from "../src/hcaptcha-site-key.vo";

describe("HCaptchaSiteKey VO", () => {
  test("happy path", () => {
    expect(HCaptchaSiteKey.safeParse("a".repeat(36)).success).toEqual(true);
    expect(HCaptchaSiteKey.safeParse("A".repeat(36)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => HCaptchaSiteKey.parse(null)).toThrow("hcaptcha.site.key.type");
  });

  test("rejects non-string - number", () => {
    expect(() => HCaptchaSiteKey.parse(123)).toThrow("hcaptcha.site.key.type");
  });

  test("rejects empty", () => {
    expect(() => HCaptchaSiteKey.parse("")).toThrow("hcaptcha.site.key.length");
  });

  test("rejects too long", () => {
    expect(() => HCaptchaSiteKey.parse(`${"a".repeat(36)}a`)).toThrow("hcaptcha.site.key.length");
  });
});
