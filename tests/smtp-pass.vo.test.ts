import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { SmtpPass } from "../src/smtp-pass.vo";

describe("SmtpPass", () => {
  test("happy path", () => {
    expect(v.safeParse(SmtpPass, "a".repeat(128)).success).toEqual(true);
    expect(v.safeParse(SmtpPass, "A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(SmtpPass, null)).toThrow("smtp.pass.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(SmtpPass, 123)).toThrow("smtp.pass.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(SmtpPass, "")).toThrow("smtp.pass.empty");
  });

  test("rejects too long", () => {
    expect(() => v.parse(SmtpPass, `${"a".repeat(128)}a`)).toThrow("smtp.pass.too.long");
  });
});
