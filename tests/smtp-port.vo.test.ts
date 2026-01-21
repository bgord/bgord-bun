import { describe, expect, test } from "bun:test";
import { SmtpPort } from "../src/smtp-port.vo";

describe("SmtpPort VO", () => {
  test("happy path", () => {
    expect(SmtpPort.safeParse(0).success).toEqual(true);
    expect(SmtpPort.safeParse("80").success).toEqual(true);
    expect(SmtpPort.safeParse(443).success).toEqual(true);
    expect(SmtpPort.safeParse("99999").success).toEqual(true);
  });

  test("transforms null to 0", () => {
    // @ts-expect-error Coercion
    expect(SmtpPort.safeParse(null)).toEqual({ success: true, data: 0 });
  });

  test("transforms string to int", () => {
    // @ts-expect-error Coercion
    expect(SmtpPort.safeParse("123")).toEqual({ success: true, data: 123 });
  });

  test("transforms negative numbers to 1", () => {
    expect(() => SmtpPort.parse(-2)).toThrow("port.invalid");
  });

  test("rejects fractions", () => {
    expect(() => SmtpPort.parse(1.5)).toThrow("port.type");
  });
});
