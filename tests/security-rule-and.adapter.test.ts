import { describe, expect, test } from "bun:test";
import { SecurityRuleAndAdapter } from "../src/security-rule-and.adapter";
import { SecurityRuleBaitRoutesAdapter } from "../src/security-rule-bait-routes.adapter";
import { SecurityRuleFailAdapter } from "../src/security-rule-fail.adapter";

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
});
