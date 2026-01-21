import { describe, expect, test } from "bun:test";
import { SecurityRuleBaitRoutesStrategy } from "../src/security-rule-bait-routes.strategy";
import { SecurityRuleName } from "../src/security-rule-name.vo";
import { RequestContextBuilder } from "./request-context-builder";

const forbidden = "/.env";
const allowed = "/about";
const rule = new SecurityRuleBaitRoutesStrategy([forbidden]);

describe("SecurityRuleBaitRoutesStrategy", () => {
  test("isViolated - true", async () => {
    const context = new RequestContextBuilder().withPath(forbidden).build();

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false", async () => {
    const context = new RequestContextBuilder().withPath(allowed).build();

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("name", () => {
    expect(rule.name).toEqual(SecurityRuleName.parse("bait_routes"));
  });
});
