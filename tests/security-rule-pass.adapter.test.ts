import { describe, expect, test } from "bun:test";
import { SecurityRuleName } from "../src/security-rule-name.vo";
import { SecurityRulePassAdapter } from "../src/security-rule-pass.adapter";

const rule = new SecurityRulePassAdapter();

describe("SecurityRulePassAdapter", () => {
  test("isViolated - false", async () => {
    expect(await rule.isViolated()).toEqual(false);
  });

  test("name", () => {
    expect(rule.name).toEqual(SecurityRuleName.parse("pass"));
  });
});
