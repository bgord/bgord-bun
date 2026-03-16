import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";

describe("SecurityCountermeasureName", () => {
  test("happy path", () => {
    expect(v.safeParse(SecurityCountermeasureName, "a".repeat(64)).success).toEqual(true);
    expect(v.safeParse(SecurityCountermeasureName, "A".repeat(64)).success).toEqual(true);
    expect(v.safeParse(SecurityCountermeasureName, "ban_someone").success).toEqual(true);
  });

  test("rejects prefix", () => {
    expect(() => v.parse(SecurityCountermeasureName, "!abc")).toThrow(
      "security.countermeasure.name.bad.chars",
    );
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(SecurityCountermeasureName, null)).toThrow("security.countermeasure.name.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(SecurityCountermeasureName, 123)).toThrow("security.countermeasure.name.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(SecurityCountermeasureName, "")).toThrow("security.countermeasure.name.empty");
  });

  test("rejects too long", () => {
    expect(() => v.parse(SecurityCountermeasureName, `${"a".repeat(64)}abc`)).toThrow(
      "security.countermeasure.name.too.long",
    );
  });

  test("rejects bad chars", () => {
    expect(() => v.parse(SecurityCountermeasureName, `${"a".repeat(63)}!`)).toThrow(
      "security.countermeasure.name.bad.chars",
    );
  });
});
