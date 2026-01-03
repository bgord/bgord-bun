import { describe, expect, test } from "bun:test";
import { SecurityRuleAndStrategy } from "../src/security-rule-and.strategy";
import { SecurityRuleFailStrategy } from "../src/security-rule-fail.strategy";
import { SecurityRuleName } from "../src/security-rule-name.vo";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";

const fail = new SecurityRuleFailStrategy();
const pass = new SecurityRulePassStrategy();

describe("SecurityRuleAndStrategy", () => {
  test("isViolated - true - all failures", async () => {
    const context = {} as any;
    const rule = new SecurityRuleAndStrategy([fail, fail]);

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false - one failure", async () => {
    const context = {} as any;
    const rule = new SecurityRuleAndStrategy([pass, fail]);

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("isViolated - false - no failures", async () => {
    const context = {} as any;
    const rule = new SecurityRuleAndStrategy([pass, pass]);

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("missing rules", () => {
    expect(() => new SecurityRuleAndStrategy([])).toThrow("security.rule.and.adapter.error.missing.rules");
  });

  test("just enough rules", () => {
    expect(() => new SecurityRuleAndStrategy([fail, fail, fail, fail, fail])).not.toThrow();
  });

  test("max rules", () => {
    expect(() => new SecurityRuleAndStrategy([fail, fail, fail, fail, fail, fail])).toThrow(
      "security.rule.and.adapter.error.max.rules",
    );
  });

  test("name", () => {
    const rule = new SecurityRuleAndStrategy([pass, fail]);
    expect(rule.name).toEqual(SecurityRuleName.parse("and_pass_fail"));
  });
});
