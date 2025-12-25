import { describe, expect, test } from "bun:test";
import { SecurityRuleName } from "../src/security-rule-name.vo";
import { SecurityRuleUserAgentAdapter } from "../src/security-rule-user-agent.adapter";
import * as mocks from "./mocks";

const valid = "anon";
const invalid = "unknown";

describe("SecurityRuleUserAgentAdapter", () => {
  test("isViolated - true", async () => {
    const rule = new SecurityRuleUserAgentAdapter([valid]);
    const context = { env: mocks.ip, req: { raw: {}, header: () => valid } } as any;

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false", async () => {
    const rule = new SecurityRuleUserAgentAdapter([invalid]);
    const context = { env: mocks.ip, req: { raw: {}, header: () => valid } } as any;

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("name", () => {
    const rule = new SecurityRuleUserAgentAdapter(["other"]);

    expect(rule.name).toEqual(SecurityRuleName.parse("user_agent"));
  });
});
