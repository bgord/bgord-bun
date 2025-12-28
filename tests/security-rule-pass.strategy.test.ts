import { describe, expect, test } from "bun:test";
import { SecurityRuleName } from "../src/security-rule-name.vo";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";

const rule = new SecurityRulePassStrategy();

describe("SecurityRulePassStrategy", () => {
  test("isViolated - false", async () => {
    expect(await rule.isViolated()).toEqual(false);
  });

  test("name", () => {
    expect(rule.name).toEqual(SecurityRuleName.parse("pass"));
  });
});
