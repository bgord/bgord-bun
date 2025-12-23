import { describe, expect, test } from "bun:test";
import { SecurityRuleNoopAdapter } from "../src/security-rule-noop.adapter";

const rule = new SecurityRuleNoopAdapter();

describe("SecurityRuleNoopAdapter", () => {
  test("check - false", async () => {
    expect(await rule.check()).toEqual(false);
  });
});
