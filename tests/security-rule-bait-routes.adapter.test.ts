import { describe, expect, test } from "bun:test";
import { SecurityRuleBaitRoutesAdapter } from "../src/security-rule-bait-routes.adapter";

const forbidden = "/.env";
const allowed = "/about";
const rule = new SecurityRuleBaitRoutesAdapter([forbidden]);

describe("SecurityRuleBaitRoutesAdapter", () => {
  test("isViolated - true", async () => {
    const context = { req: { path: forbidden } } as any;

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false", async () => {
    const context = { req: { path: allowed } } as any;

    expect(await rule.isViolated(context)).toEqual(false);
  });
});
