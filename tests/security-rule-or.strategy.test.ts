import { describe, expect, test } from "bun:test";
import { SecurityRuleBaitRoutesStrategy } from "../src/security-rule-bait-routes.strategy";
import { SecurityRuleFailStrategy } from "../src/security-rule-fail.strategy";
import { SecurityRuleName } from "../src/security-rule-name.vo";
import { SecurityRuleOrStrategy } from "../src/security-rule-or.strategy";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";

const forbidden = "/.env";
const allowed = "/about";

const baitRoutes = new SecurityRuleBaitRoutesStrategy([forbidden]);
const pass = new SecurityRulePassStrategy();
const fail = new SecurityRuleFailStrategy();

describe("SecurityRuleOrStrategy", () => {
  test("isViolated - one violation", async () => {
    const rule = new SecurityRuleOrStrategy([fail, pass]);
    const context = { req: { path: allowed } } as any;

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - all violated", async () => {
    const rule = new SecurityRuleOrStrategy([fail, fail]);
    const context = { req: { path: allowed } } as any;

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false", async () => {
    const rule = new SecurityRuleOrStrategy([pass, pass]);
    const context = { req: { path: allowed } } as any;

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("missing rules", () => {
    expect(() => new SecurityRuleOrStrategy([])).toThrow("security.rule.or.adapter.error.missing.rules");
  });

  test("just enough rules", () => {
    expect(() => new SecurityRuleOrStrategy([pass, pass, pass, pass, pass])).not.toThrow();
  });

  test("max rules", () => {
    expect(() => new SecurityRuleOrStrategy([pass, pass, pass, pass, pass, pass])).toThrow(
      "security.rule.or.adapter.error.max.rules",
    );
  });

  test("name", () => {
    const rule = new SecurityRuleOrStrategy([baitRoutes, pass]);

    expect(rule.name).toEqual(SecurityRuleName.parse("or_bait_routes_pass"));
  });
});
