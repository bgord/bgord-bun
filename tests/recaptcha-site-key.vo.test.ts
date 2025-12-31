import { describe, expect, test } from "bun:test";
import { RecaptchaSiteKey } from "../src/recaptcha-site-key.vo";

describe("RecaptchaSiteKey VO", () => {
  test("happy path", () => {
    expect(RecaptchaSiteKey.safeParse("a".repeat(40)).success).toEqual(true);
    expect(RecaptchaSiteKey.safeParse("A".repeat(40)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => RecaptchaSiteKey.parse(null)).toThrow("recaptcha.site.key.type");
  });

  test("rejects non-string - number", () => {
    expect(() => RecaptchaSiteKey.parse(123)).toThrow("recaptcha.site.key.type");
  });

  test("rejects empty", () => {
    expect(() => RecaptchaSiteKey.parse("")).toThrow("recaptcha.site.key.length");
  });

  test("rejects too long", () => {
    expect(() => RecaptchaSiteKey.parse(`${"a".repeat(40)}a`)).toThrow("recaptcha.site.key.length");
  });
});
