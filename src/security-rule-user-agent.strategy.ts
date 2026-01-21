import { ALL_BOTS } from "./bots.vo";
import { Client } from "./client.vo";
import { ClientUserAgent } from "./client-user-agent.vo";
import type { RequestContext } from "./request-context.port";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, type SecurityRuleNameType } from "./security-rule-name.vo";

export class SecurityRuleUserAgentStrategy implements SecurityRuleStrategy {
  constructor(private readonly blacklist: string[] = ALL_BOTS) {}

  async isViolated(context: RequestContext): Promise<boolean> {
    const client = Client.fromParts(context.identity.ip(), context.identity.userAgent());

    return this.blacklist.some((bot) => client.matchesUa(ClientUserAgent.parse(bot)));
  }

  get name(): SecurityRuleNameType {
    return SecurityRuleName.parse("user_agent");
  }
}
