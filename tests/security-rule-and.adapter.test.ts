import { describe, expect, test } from "bun:test";
import { SecurityRuleAndAdapter, SecurityRuleAndAdapterError } from "../src/security-rule-and.adapter";
import { SecurityRuleBaitRoutesAdapter } from "../src/security-rule-bait-routes.adapter";
import { SecurityRuleFailAdapter } from "../src/security-rule-fail.adapter";
import { SecurityRuleName } from "../src/security-rule-name.vo";

const forbidden = "/.env";
const allowed = "/about";
const baitRoutes = new SecurityRuleBaitRoutesAdapter([forbidden]);

const fail = new SecurityRuleFailAdapter();

const rule = new SecurityRuleAndAdapter([baitRoutes, fail]);

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
    expect(() => new SecurityRuleAndAdapter([])).toThrow(SecurityRuleAndAdapterError.MissingRules);
  });

  test("max rules", () => {
    expect(() => new SecurityRuleAndAdapter([fail, fail, fail, fail, fail, fail])).toThrow(
      SecurityRuleAndAdapterError.MaxRules,
    );
  });

  test("name", () => {
    expect(rule.name).toEqual(SecurityRuleName.parse("and_bait_routes_fail"));
  });
});
