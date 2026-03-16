import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { SecurityRuleName } from "../src/security-rule-name.vo";
import { SecurityRuleUserAgentStrategy } from "../src/security-rule-user-agent.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const valid = "valid";
const invalid = "unknown";

describe("SecurityRuleUserAgentStrategy", () => {
  test("isViolated - true - single", async () => {
    const rule = new SecurityRuleUserAgentStrategy([valid]);
    const context = new RequestContextBuilder().withUa(valid).build();

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false - single", async () => {
    const rule = new SecurityRuleUserAgentStrategy([invalid]);
    const context = new RequestContextBuilder().withUa(valid).build();

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("isViolated - true - multiple - first", async () => {
    const rule = new SecurityRuleUserAgentStrategy(["google", "bing"]);
    const context = new RequestContextBuilder().withUa("google").build();

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false - multiple - none", async () => {
    const rule = new SecurityRuleUserAgentStrategy(["google", "bing"]);
    const context = new RequestContextBuilder().withUa(valid).build();

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("name", () => {
    const rule = new SecurityRuleUserAgentStrategy(["other"]);

    expect(rule.name).toEqual(v.parse(SecurityRuleName, "user_agent"));
  });
});
