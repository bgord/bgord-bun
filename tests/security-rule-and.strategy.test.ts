import { describe, expect, test } from "bun:test";
import { SecurityRuleAndStrategy, SecurityRuleAndStrategyError } from "../src/security-rule-and.strategy";
import { SecurityRuleBaitRoutesStrategy } from "../src/security-rule-bait-routes.strategy";
import { SecurityRuleFailStrategy } from "../src/security-rule-fail.strategy";
import { SecurityRuleName } from "../src/security-rule-name.vo";

const forbidden = "/.env";
const allowed = "/about";
const baitRoutes = new SecurityRuleBaitRoutesStrategy([forbidden]);

const fail = new SecurityRuleFailStrategy();

const rule = new SecurityRuleAndStrategy([baitRoutes, fail]);

describe("SecurityRuleAndStrategy", () => {
  test("isViolated - true", async () => {
    const context = { req: { path: forbidden } } as any;

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false", async () => {
    const context = { req: { path: allowed } } as any;

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("missing rules", () => {
    expect(() => new SecurityRuleAndStrategy([])).toThrow(SecurityRuleAndStrategyError.MissingRules);
  });

  test("just enough rules", () => {
    expect(() => new SecurityRuleAndStrategy([fail, fail, fail, fail, fail])).not.toThrow();
  });

  test("max rules", () => {
    expect(() => new SecurityRuleAndStrategy([fail, fail, fail, fail, fail, fail])).toThrow(
      SecurityRuleAndStrategyError.MaxRules,
    );
  });

  test("name", () => {
    expect(rule.name).toEqual(SecurityRuleName.parse("and_bait_routes_fail"));
  });
});
