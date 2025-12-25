import { describe, expect, test } from "bun:test";
import { SecurityRuleFailAdapter } from "../src/security-rule-fail.adapter";
import { SecurityRuleName } from "../src/security-rule-name.vo";

const rule = new SecurityRuleFailAdapter();

describe("SecurityRuleFailAdapter", () => {
  test("isViolated - true", async () => {
    expect(await rule.isViolated()).toEqual(true);
  });

  test("name", () => {
    expect(rule.name).toEqual(SecurityRuleName.parse("fail"));
  });
});
