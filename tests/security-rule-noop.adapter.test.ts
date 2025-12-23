import { describe, expect, test } from "bun:test";
import { SecurityRuleNoopAdapter } from "../src/security-rule-noop.adapter";

const rule = new SecurityRuleNoopAdapter();

describe("SecurityRuleNoopAdapter", () => {
  test("isViolated - false", async () => {
    expect(await rule.isViolated()).toEqual(false);
  });
});
