import { describe, expect, test } from "bun:test";
import { SmtpUser } from "../src/smtp-user.vo";

describe("SmtpUser VO", () => {
  test("happy path", () => {
    expect(SmtpUser.safeParse("a".repeat(128)).success).toEqual(true);
    expect(SmtpUser.safeParse("A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => SmtpUser.parse(null)).toThrow("smtp.user.type");
  });

  test("rejects non-string - number", () => {
    expect(() => SmtpUser.parse(123)).toThrow("smtp.user.type");
  });

  test("rejects empty", () => {
    expect(() => SmtpUser.parse("")).toThrow("smtp.user.empty");
  });

  test("rejects too long", () => {
    expect(() => SmtpUser.parse(`${"a".repeat(128)}a`)).toThrow("smtp.user.too.long");
  });
});
