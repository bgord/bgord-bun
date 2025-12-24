import { describe, expect, test } from "bun:test";
import { SecurityRuleFailAdapter } from "../src/security-rule-fail.adapter";

const rule = new SecurityRuleFailAdapter();

describe("SecurityRuleFailAdapter", () => {
  test("isViolated - true", async () => {
    expect(await rule.isViolated()).toEqual(true);
  });
});
