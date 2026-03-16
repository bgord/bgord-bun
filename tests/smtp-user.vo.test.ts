import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { SmtpUser } from "../src/smtp-user.vo";

describe("SmtpUser", () => {
  test("happy path", () => {
    expect(v.safeParse(SmtpUser, "a".repeat(128)).success).toEqual(true);
    expect(v.safeParse(SmtpUser, "A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(SmtpUser, null)).toThrow("smtp.user.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(SmtpUser, 123)).toThrow("smtp.user.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(SmtpUser, "")).toThrow("smtp.user.empty");
  });

  test("rejects too long", () => {
    expect(() => v.parse(SmtpUser, `${"a".repeat(128)}a`)).toThrow("smtp.user.too.long");
  });
});
