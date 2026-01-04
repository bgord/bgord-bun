import { describe, expect, test } from "bun:test";
import { SmtpHost } from "../src/smtp-host.vo";

describe("SmtpHost VO", () => {
  test("happy path", () => {
    expect(SmtpHost.safeParse("a".repeat(128)).success).toEqual(true);
    expect(SmtpHost.safeParse("A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => SmtpHost.parse(null)).toThrow("smtp.host.type");
  });

  test("rejects non-string - number", () => {
    expect(() => SmtpHost.parse(123)).toThrow("smtp.host.type");
  });

  test("rejects empty", () => {
    expect(() => SmtpHost.parse("")).toThrow("smtp.host.empty");
  });

  test("rejects too long", () => {
    expect(() => SmtpHost.parse(`${"a".repeat(128)}a`)).toThrow("smtp.host.too.long");
  });
});
