import { describe, expect, test } from "bun:test";
import { SecurityRuleName } from "../src/security-rule-name.vo";
import { SecurityRuleUserAgentStrategy } from "../src/security-rule-user-agent.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const valid = "anon";
const invalid = "unknown";

describe("SecurityRuleUserAgentStrategy", () => {
  test("isViolated - true", async () => {
    const rule = new SecurityRuleUserAgentStrategy([valid]);
    const context = new RequestContextBuilder().withUserAgent(valid).build();

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false", async () => {
    const rule = new SecurityRuleUserAgentStrategy([invalid]);
    const context = new RequestContextBuilder().withUserAgent(valid).build();

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("name", () => {
    const rule = new SecurityRuleUserAgentStrategy(["other"]);

    expect(rule.name).toEqual(SecurityRuleName.parse("user_agent"));
  });
});
