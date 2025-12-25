import { describe, expect, test } from "bun:test";
import {
  SecurityCountermeasureName,
  SecurityCountermeasureNameError,
} from "../src/security-countermeasure-name.vo";

describe("SecurityCountermeasureName VO", () => {
  test("happy path", () => {
    expect(SecurityCountermeasureName.safeParse("a".repeat(64)).success).toEqual(true);
    expect(SecurityCountermeasureName.safeParse("A".repeat(64)).success).toEqual(true);
    expect(SecurityCountermeasureName.safeParse("ban_someone").success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => SecurityCountermeasureName.parse(null)).toThrow(SecurityCountermeasureNameError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => SecurityCountermeasureName.parse(123)).toThrow(SecurityCountermeasureNameError.Type);
  });

  test("rejects empty", () => {
    expect(() => SecurityCountermeasureName.parse("")).toThrow(SecurityCountermeasureNameError.Empty);
  });

  test("rejects too long", () => {
    expect(() => SecurityCountermeasureName.parse(`${"a".repeat(64)}abc`)).toThrow(
      SecurityCountermeasureNameError.TooLong,
    );
  });

  test("rejects bad chars", () => {
    expect(() => SecurityCountermeasureName.parse(`${"a".repeat(63)}!`)).toThrow(
      SecurityCountermeasureNameError.BadChars,
    );
  });
});
