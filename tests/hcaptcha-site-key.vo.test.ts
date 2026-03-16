import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { HCaptchaSiteKey } from "../src/hcaptcha-site-key.vo";

describe("HCaptchaSiteKey", () => {
  test("happy path", () => {
    expect(v.safeParse(HCaptchaSiteKey, "a".repeat(36)).success).toEqual(true);
    expect(v.safeParse(HCaptchaSiteKey, "A".repeat(36)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(HCaptchaSiteKey, null)).toThrow("hcaptcha.site.key.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(HCaptchaSiteKey, 123)).toThrow("hcaptcha.site.key.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(HCaptchaSiteKey, "")).toThrow("hcaptcha.site.key.length");
  });

  test("rejects too long", () => {
    expect(() => v.parse(HCaptchaSiteKey, `${"a".repeat(36)}a`)).toThrow("hcaptcha.site.key.length");
  });
});
