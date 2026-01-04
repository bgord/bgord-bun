import { describe, expect, test } from "bun:test";
import { MailerContentHtml } from "../src/mailer-content-html.vo";

describe("MailerContentHtml VO", () => {
  test("happy path", () => {
    expect(MailerContentHtml.safeParse("a".repeat(10_000)).success).toEqual(true);
    expect(MailerContentHtml.safeParse("A".repeat(10_000)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => MailerContentHtml.parse(null)).toThrow("mailer.content.html.invalid");
  });

  test("rejects non-string - number", () => {
    expect(() => MailerContentHtml.parse(123)).toThrow("mailer.content.html.invalid");
  });

  test("rejects empty", () => {
    expect(() => MailerContentHtml.parse("")).toThrow("mailer.content.html.invalid");
  });

  test("rejects too long", () => {
    expect(() => MailerContentHtml.parse(`${"a".repeat(10_000)}a`)).toThrow("mailer.content.html.invalid");
  });
});
