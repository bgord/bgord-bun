import { describe, expect, test } from "bun:test";
import { EmailContentHtml, EmailContentHtmlError, EmailSubject, EmailSubjectError } from "../src/mailer.vo";

describe("Mailer VOs", () => {
  test("EmailSubject - happy path", () => {
    expect(EmailSubject.safeParse("Welcome to our newsletter").success).toEqual(true);
  });

  test("EmailSubject - empty", () => {
    expect(() => EmailSubject.parse("")).toThrow(EmailSubjectError.Invalid);
  });

  test("EmailSubject - too long", () => {
    expect(() => EmailSubject.parse("a".repeat(129))).toThrow(EmailSubjectError.Invalid);
  });

  test("EmailContentHtml - happy path", () => {
    expect(EmailContentHtml.safeParse("<p>Hello, world!</p>").success).toEqual(true);
  });

  test("EmailContentHtml - empty", () => {
    expect(() => EmailContentHtml.parse("")).toThrow(EmailContentHtmlError.Invalid);
  });

  test("EmailContentHtml - too long", () => {
    expect(() => EmailContentHtml.parse("a".repeat(10_001))).toThrow(EmailContentHtmlError.Invalid);
  });
});
