import { describe, expect, test } from "bun:test";
import { SecurityRuleFailStrategy } from "../src/security-rule-fail.strategy";
import { SecurityRuleName } from "../src/security-rule-name.vo";

const rule = new SecurityRuleFailStrategy();

describe("SecurityRuleFailStrategy", () => {
  test("isViolated - true", async () => {
    expect(await rule.isViolated()).toEqual(true);
  });

  test("name", () => {
    expect(rule.name).toEqual(SecurityRuleName.parse("fail"));
  });
});
