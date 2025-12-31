import { describe, expect, test } from "bun:test";
import { EmailContentHtml, EmailSubject } from "../src/mailer.vo";

describe("Mailer VOs", () => {
  test("EmailSubject - happy path", () => {
    expect(EmailSubject.safeParse("Welcome to our newsletter").success).toEqual(true);
  });

  test("EmailSubject - empty", () => {
    expect(() => EmailSubject.parse("")).toThrow("email.subject.invalid");
  });

  test("EmailSubject - too long", () => {
    expect(() => EmailSubject.parse("a".repeat(129))).toThrow("email.subject.invalid");
  });

  test("EmailContentHtml - happy path", () => {
    expect(EmailContentHtml.safeParse("<p>Hello, world!</p>").success).toEqual(true);
  });

  test("EmailContentHtml - empty", () => {
    expect(() => EmailContentHtml.parse("")).toThrow("email.content.html.invalid");
  });

  test("EmailContentHtml - too long", () => {
    expect(() => EmailContentHtml.parse("a".repeat(10_001))).toThrow("email.content.html.invalid");
  });
});
