import { describe, expect, test } from "bun:test";
import { SecurityRuleBaitRoutesAdapter } from "../src/security-rule-bait-routes.adapter";
import { SecurityRuleOrAdapter, SecurityRuleOrAdapterError } from "../src/security-rule-or.adapter";
import { SecurityRulePassAdapter } from "../src/security-rule-pass.adapter";

const forbidden = "/.env";
const allowed = "/about";
const baitRoutes = new SecurityRuleBaitRoutesAdapter([forbidden]);

const pass = new SecurityRulePassAdapter();

const rule = new SecurityRuleOrAdapter([baitRoutes, pass]);

describe("SecurityRuleAndAdapter", () => {
  test("isViolated - true", async () => {
    const context = { req: { path: forbidden } } as any;

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false", async () => {
    const context = { req: { path: allowed } } as any;

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("missing rules", () => {
    expect(() => new SecurityRuleOrAdapter([])).toThrow(SecurityRuleOrAdapterError.MissingRules);
  });

  test("name", () => {
    expect(rule.name).toEqual("or_bait_routes_pass");
  });
});
