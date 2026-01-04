import { describe, expect, test } from "bun:test";
import { MailerSubject } from "../src/mailer-subject.vo";

describe("MailerSubject VO", () => {
  test("happy path", () => {
    expect(MailerSubject.safeParse("a".repeat(128)).success).toEqual(true);
    expect(MailerSubject.safeParse("A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => MailerSubject.parse(null)).toThrow("mailer.subject.invalid");
  });

  test("rejects non-string - number", () => {
    expect(() => MailerSubject.parse(123)).toThrow("mailer.subject.invalid");
  });

  test("rejects empty", () => {
    expect(() => MailerSubject.parse("")).toThrow("mailer.subject.invalid");
  });

  test("rejects too long", () => {
    expect(() => MailerSubject.parse(`${"a".repeat(128)}a`)).toThrow("mailer.subject.invalid");
  });
});
