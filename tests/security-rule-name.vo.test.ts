import { describe, expect, test } from "bun:test";
import { SecurityRuleName, SecurityRuleNameError } from "../src/security-rule-name.vo";

describe("SecurityRuleName VO", () => {
  test("happy path", () => {
    expect(SecurityRuleName.safeParse("a".repeat(512)).success).toEqual(true);
    expect(SecurityRuleName.safeParse("A".repeat(512)).success).toEqual(true);
    expect(SecurityRuleName.safeParse("honey_pot").success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => SecurityRuleName.parse(null)).toThrow(SecurityRuleNameError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => SecurityRuleName.parse(123)).toThrow(SecurityRuleNameError.Type);
  });

  test("rejects empty", () => {
    expect(() => SecurityRuleName.parse("")).toThrow(SecurityRuleNameError.Empty);
  });

  test("rejects too long", () => {
    expect(() => SecurityRuleName.parse(`${"a".repeat(512)}abc`)).toThrow(SecurityRuleNameError.TooLong);
  });

  test("rejects bad chars", () => {
    expect(() => SecurityRuleName.parse(`${"a".repeat(511)}!`)).toThrow(SecurityRuleNameError.BadChars);
  });
});
