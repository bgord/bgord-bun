import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { SecurityRuleName } from "../src/security-rule-name.vo";

describe("SecurityRuleName", () => {
  test("happy path", () => {
    expect(v.safeParse(SecurityRuleName, "a".repeat(512)).success).toEqual(true);
    expect(v.safeParse(SecurityRuleName, "A".repeat(512)).success).toEqual(true);
    expect(v.safeParse(SecurityRuleName, "honey_pot").success).toEqual(true);
  });

  test("rejects prefix", () => {
    expect(() => v.parse(SecurityRuleName, "!abc")).toThrow("security.rule.name.bad.chars");
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(SecurityRuleName, null)).toThrow("security.rule.name.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(SecurityRuleName, 123)).toThrow("security.rule.name.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(SecurityRuleName, "")).toThrow("security.rule.name.bad.chars");
  });

  test("rejects too long", () => {
    expect(() => v.parse(SecurityRuleName, `${"a".repeat(512)}abc`)).toThrow("security.rule.name.bad.chars");
  });

  test("rejects bad chars", () => {
    expect(() => v.parse(SecurityRuleName, `${"a".repeat(511)}!`)).toThrow("security.rule.name.bad.chars");
  });
});
