import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { MailerSubject } from "../src/mailer-subject.vo";

describe("MailerSubject", () => {
  test("happy path", () => {
    expect(v.safeParse(MailerSubject, "a".repeat(128)).success).toEqual(true);
    expect(v.safeParse(MailerSubject, "A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(MailerSubject, null)).toThrow("mailer.subject.invalid");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(MailerSubject, 123)).toThrow("mailer.subject.invalid");
  });

  test("rejects empty", () => {
    expect(() => v.parse(MailerSubject, "")).toThrow("mailer.subject.invalid");
  });

  test("rejects too long", () => {
    expect(() => v.parse(MailerSubject, `${"a".repeat(128)}a`)).toThrow("mailer.subject.invalid");
  });
});
