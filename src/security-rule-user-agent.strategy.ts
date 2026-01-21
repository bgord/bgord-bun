import type { Context } from "hono";
import { ALL_BOTS } from "./bots.vo";
import { ClientFromHono } from "./client-from-hono.adapter";
import { ClientUserAgent } from "./client-user-agent.vo";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, SecurityRuleNameType } from "./security-rule-name.vo";

export class SecurityRuleUserAgentStrategy implements SecurityRuleStrategy {
  constructor(private readonly blacklist: string[] = ALL_BOTS) {}

  async isViolated(c: Context): Promise<boolean> {
    const client = ClientFromHono.translate(c);

    return this.blacklist.some((bot) => client.matchesUa(ClientUserAgent.parse(bot)));
  }

  get name(): SecurityRuleNameType {
    return SecurityRuleName.parse("user_agent");
  }
}
