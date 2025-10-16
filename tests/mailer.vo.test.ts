import { describe, expect, test } from "bun:test";
import {
  EmailContentHtml,
  EmailContentHtmlError,
  EmailFrom,
  EmailFromError,
  EmailSubject,
  EmailSubjectError,
  EmailTo,
  EmailToError,
} from "../src/mailer.vo";

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

  test("EmailFrom - happy path", () => {
    expect(EmailFrom.safeParse("test@example.com").success).toEqual(true);
  });

  test("EmailFrom - invalid", () => {
    expect(() => EmailFrom.parse("not-an-email")).toThrow(EmailFromError.Invalid);
  });

  test("EmailTo - happy path", () => {
    expect(EmailTo.safeParse("test@example.com").success).toEqual(true);
  });

  test("EmailTo - invalid", () => {
    expect(() => EmailTo.parse("not-an-email")).toThrow(EmailToError.Invalid);
  });
});
