/* cSpell:ignore claudebot */
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

  test("isViolated - true - token inside a full user agent", async () => {
    const rule = new SecurityRuleUserAgentStrategy();
    const context = new RequestContextBuilder()
      .withUa("Mozilla/5.0 AppleWebKit/537.36 (compatible; GPTBot/1.1; +https://openai.com/gptbot)")
      .build();

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - true - case insensitive", async () => {
    const rule = new SecurityRuleUserAgentStrategy();
    const context = new RequestContextBuilder()
      .withUa("Mozilla/5.0 (compatible; claudebot/1.0; +claudebot@anthropic.com)")
      .build();

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false - browser user agent", async () => {
    const rule = new SecurityRuleUserAgentStrategy();
    const context = new RequestContextBuilder()
      .withUa(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      )
      .build();

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("isViolated - false - missing user agent", async () => {
    const rule = new SecurityRuleUserAgentStrategy();
    const context = new RequestContextBuilder().build();

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("name", () => {
    const rule = new SecurityRuleUserAgentStrategy(["other"]);

    expect(rule.name).toEqual(v.parse(SecurityRuleName, "user_agent"));
  });
});
