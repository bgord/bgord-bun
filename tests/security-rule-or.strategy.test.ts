import { describe, expect, test } from "bun:test";
import { SecurityRuleBaitRoutesStrategy } from "../src/security-rule-bait-routes.strategy";
import { SecurityRuleName } from "../src/security-rule-name.vo";
import { SecurityRuleOrStrategy, SecurityRuleOrStrategyError } from "../src/security-rule-or.strategy";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";

const forbidden = "/.env";
const allowed = "/about";
const baitRoutes = new SecurityRuleBaitRoutesStrategy([forbidden]);

const pass = new SecurityRulePassStrategy();

const rule = new SecurityRuleOrStrategy([baitRoutes, pass]);

describe("SecurityRuleOrStrategy", () => {
  test("isViolated - true", async () => {
    const context = { req: { path: forbidden } } as any;

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false", async () => {
    const context = { req: { path: allowed } } as any;

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("missing rules", () => {
    expect(() => new SecurityRuleOrStrategy([])).toThrow(SecurityRuleOrStrategyError.MissingRules);
  });

  test("just enough rules", () => {
    expect(() => new SecurityRuleOrStrategy([pass, pass, pass, pass, pass])).not.toThrow();
  });

  test("max rules", () => {
    expect(() => new SecurityRuleOrStrategy([pass, pass, pass, pass, pass, pass])).toThrow(
      SecurityRuleOrStrategyError.MaxRules,
    );
  });

  test("name", () => {
    expect(rule.name).toEqual(SecurityRuleName.parse("or_bait_routes_pass"));
  });
});
