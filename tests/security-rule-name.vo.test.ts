import { describe, expect, test } from "bun:test";
import { SecurityRuleName } from "../src/security-rule-name.vo";

describe("SecurityRuleName VO", () => {
  test("happy path", () => {
    expect(SecurityRuleName.safeParse("a".repeat(512)).success).toEqual(true);
    expect(SecurityRuleName.safeParse("A".repeat(512)).success).toEqual(true);
    expect(SecurityRuleName.safeParse("honey_pot").success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => SecurityRuleName.parse(null)).toThrow("security.rule.name.type");
  });

  test("rejects non-string - number", () => {
    expect(() => SecurityRuleName.parse(123)).toThrow("security.rule.name.type");
  });

  test("rejects empty", () => {
    expect(() => SecurityRuleName.parse("")).toThrow("security.rule.name.empty");
  });

  test("rejects too long", () => {
    expect(() => SecurityRuleName.parse(`${"a".repeat(512)}abc`)).toThrow("security.rule.name.too.long");
  });

  test("rejects bad chars", () => {
    expect(() => SecurityRuleName.parse(`${"a".repeat(511)}!`)).toThrow("security.rule.name.bad.chars");
  });
});
