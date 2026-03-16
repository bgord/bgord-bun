import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { RecaptchaSiteKey } from "../src/recaptcha-site-key.vo";

describe("RecaptchaSiteKey", () => {
  test("happy path", () => {
    expect(v.safeParse(RecaptchaSiteKey, "a".repeat(40)).success).toEqual(true);
    expect(v.safeParse(RecaptchaSiteKey, "A".repeat(40)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(RecaptchaSiteKey, null)).toThrow("recaptcha.site.key.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(RecaptchaSiteKey, 123)).toThrow("recaptcha.site.key.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(RecaptchaSiteKey, "")).toThrow("recaptcha.site.key.length");
  });

  test("rejects too long", () => {
    expect(() => v.parse(RecaptchaSiteKey, `${"a".repeat(40)}a`)).toThrow("recaptcha.site.key.length");
  });
});
