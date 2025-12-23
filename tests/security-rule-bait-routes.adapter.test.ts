import { describe, expect, test } from "bun:test";
import { SecurityRuleBaitRoutesAdapter } from "../src/security-rule-bait-routes.adapter";

const forbidden = "/.env";
const allowed = "/about";
const rule = new SecurityRuleBaitRoutesAdapter([forbidden]);

describe("SecurityRuleBaitRoutesAdapter", () => {
  test("check - true", async () => {
    const context = { req: { path: forbidden } } as any;

    expect(await rule.check(context)).toEqual(true);
  });

  test("check - false", async () => {
    const context = { req: { path: allowed } } as any;

    expect(await rule.check(context)).toEqual(false);
  });
});
