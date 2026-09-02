import * as v from "valibot";
import { ALL_BOTS } from "./bots.vo";
import type { RequestContext } from "./request-context.port";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, type SecurityRuleNameType } from "./security-rule-name.vo";

export class SecurityRuleUserAgentStrategy implements SecurityRuleStrategy {
  constructor(private readonly blacklist: ReadonlyArray<string> = ALL_BOTS) {}

  async isViolated(context: RequestContext): Promise<boolean> {
    const ua = context.identity.ua()?.toLowerCase();

    if (!ua) return false;

    return this.blacklist.some((bot) => ua.includes(bot.toLowerCase()));
  }

  get name(): SecurityRuleNameType {
    return v.parse(SecurityRuleName, "user_agent");
  }
}
