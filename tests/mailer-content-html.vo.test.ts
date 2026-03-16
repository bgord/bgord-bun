import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { MailerContentHtml } from "../src/mailer-content-html.vo";

describe("MailerContentHtml", () => {
  test("happy path", () => {
    expect(v.safeParse(MailerContentHtml, "a".repeat(10_000)).success).toEqual(true);
    expect(v.safeParse(MailerContentHtml, "A".repeat(10_000)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(MailerContentHtml, null)).toThrow("mailer.content.html.invalid");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(MailerContentHtml, 123)).toThrow("mailer.content.html.invalid");
  });

  test("rejects empty", () => {
    expect(() => v.parse(MailerContentHtml, "")).toThrow("mailer.content.html.invalid");
  });

  test("rejects too long", () => {
    expect(() => v.parse(MailerContentHtml, `${"a".repeat(10_000)}a`)).toThrow("mailer.content.html.invalid");
  });
});
