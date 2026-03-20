import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { TelephoneNumber, TelephoneNumberError } from "../src/telephone-number.vo";

describe("TelephoneNumber", () => {
  test("happy path - US number", () => {
    expect(v.safeParse(TelephoneNumber, "+12125551234").success).toEqual(true);
  });

  test("happy path - PL number", () => {
    expect(v.safeParse(TelephoneNumber, "+48600123456").success).toEqual(true);
  });

  test("happy path - UK number", () => {
    expect(v.safeParse(TelephoneNumber, "+447911123456").success).toEqual(true);
  });

  test("happy path - max length (15 digits)", () => {
    expect(v.safeParse(TelephoneNumber, "+123456789012345").success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(TelephoneNumber, null)).toThrow(TelephoneNumberError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(TelephoneNumber, 48600123456)).toThrow(TelephoneNumberError.Type);
  });

  test("rejects missing plus prefix", () => {
    expect(() => v.parse(TelephoneNumber, "48600123456")).toThrow(TelephoneNumberError.Invalid);
  });

  test("rejects leading zero in country code", () => {
    expect(() => v.parse(TelephoneNumber, "+04860123456")).toThrow(TelephoneNumberError.Invalid);
  });

  test("rejects non-digit characters", () => {
    expect(() => v.parse(TelephoneNumber, "+1 212 555 1234")).toThrow(TelephoneNumberError.Invalid);
  });

  test("rejects dashes", () => {
    expect(() => v.parse(TelephoneNumber, "+1-212-555-1234")).toThrow(TelephoneNumberError.Invalid);
  });

  test("rejects too long - 16 digits", () => {
    expect(() => v.parse(TelephoneNumber, "+1234567890123456")).toThrow(TelephoneNumberError.Invalid);
  });

  test("rejects plus only", () => {
    expect(() => v.parse(TelephoneNumber, "+")).toThrow(TelephoneNumberError.Invalid);
  });

  test("rejects empty string", () => {
    expect(() => v.parse(TelephoneNumber, "")).toThrow(TelephoneNumberError.Invalid);
  });
});
