import { describe, expect, test } from "bun:test";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";

describe("SecurityCountermeasureName VO", () => {
  test("happy path", () => {
    expect(SecurityCountermeasureName.safeParse("a".repeat(64)).success).toEqual(true);
    expect(SecurityCountermeasureName.safeParse("A".repeat(64)).success).toEqual(true);
    expect(SecurityCountermeasureName.safeParse("ban_someone").success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => SecurityCountermeasureName.parse(null)).toThrow("security.countermeasure.name.type");
  });

  test("rejects non-string - number", () => {
    expect(() => SecurityCountermeasureName.parse(123)).toThrow("security.countermeasure.name.type");
  });

  test("rejects empty", () => {
    expect(() => SecurityCountermeasureName.parse("")).toThrow("security.countermeasure.name.empty");
  });

  test("rejects too long", () => {
    expect(() => SecurityCountermeasureName.parse(`${"a".repeat(64)}abc`)).toThrow(
      "security.countermeasure.name.too.long",
    );
  });

  test("rejects bad chars", () => {
    expect(() => SecurityCountermeasureName.parse(`${"a".repeat(63)}!`)).toThrow(
      "security.countermeasure.name.bad.chars",
    );
  });
});
