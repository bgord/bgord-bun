import { describe, expect, test } from "bun:test";
import { SecurityRuleBaitRoutesStrategy } from "../src/security-rule-bait-routes.strategy";
import { SecurityRuleName } from "../src/security-rule-name.vo";

const forbidden = "/.env";
const allowed = "/about";
const rule = new SecurityRuleBaitRoutesStrategy([forbidden]);

describe("SecurityRuleBaitRoutesStrategy", () => {
  test("isViolated - true", async () => {
    const context = { req: { path: forbidden } } as any;

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false", async () => {
    const context = { req: { path: allowed } } as any;

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("name", () => {
    expect(rule.name).toEqual(SecurityRuleName.parse("bait_routes"));
  });
});
