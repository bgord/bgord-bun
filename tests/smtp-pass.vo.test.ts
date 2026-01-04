import { describe, expect, test } from "bun:test";
import { SmtpPass } from "../src/smtp-pass.vo";

describe("SmtpPass VO", () => {
  test("happy path", () => {
    expect(SmtpPass.safeParse("a".repeat(128)).success).toEqual(true);
    expect(SmtpPass.safeParse("A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => SmtpPass.parse(null)).toThrow("smtp.pass.type");
  });

  test("rejects non-string - number", () => {
    expect(() => SmtpPass.parse(123)).toThrow("smtp.pass.type");
  });

  test("rejects empty", () => {
    expect(() => SmtpPass.parse("")).toThrow("smtp.pass.empty");
  });

  test("rejects too long", () => {
    expect(() => SmtpPass.parse(`${"a".repeat(128)}a`)).toThrow("smtp.pass.too.long");
  });
});
