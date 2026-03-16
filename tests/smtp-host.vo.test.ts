import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { SmtpHost } from "../src/smtp-host.vo";

describe("SmtpHost", () => {
  test("happy path", () => {
    expect(v.safeParse(SmtpHost, "a".repeat(128)).success).toEqual(true);
    expect(v.safeParse(SmtpHost, "A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(SmtpHost, null)).toThrow("smtp.host.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(SmtpHost, 123)).toThrow("smtp.host.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(SmtpHost, "")).toThrow("smtp.host.empty");
  });

  test("rejects too long", () => {
    expect(() => v.parse(SmtpHost, `${"a".repeat(128)}a`)).toThrow("smtp.host.too.long");
  });
});
