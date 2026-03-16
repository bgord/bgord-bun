import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { SmtpPort } from "../src/smtp-port.vo";

describe("SmtpPort", () => {
  test("happy path", () => {
    expect(v.safeParse(SmtpPort, 0).success).toEqual(true);
    expect(v.safeParse(SmtpPort, "80").success).toEqual(true);
    expect(v.safeParse(SmtpPort, 443).success).toEqual(true);
    expect(v.safeParse(SmtpPort, "99999").success).toEqual(true);
  });

  test("transforms null to 0", () => {
    expect(v.safeParse(SmtpPort, null)).toMatchObject({ success: true, output: 0 });
  });

  test("transforms string to int", () => {
    expect(v.safeParse(SmtpPort, "123")).toMatchObject({ success: true, output: 123 });
  });

  test("rejects negative numbers", () => {
    expect(() => v.parse(SmtpPort, -2)).toThrow("port.invalid");
  });

  test("rejects fractions", () => {
    expect(() => v.parse(SmtpPort, 1.5)).toThrow("port.type");
  });
});
