import { ALL_BOTS } from "./bots.vo";
import { Client } from "./client.vo";
import type { RequestContext } from "./request-context.port";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, type SecurityRuleNameType } from "./security-rule-name.vo";

export class SecurityRuleUserAgentStrategy implements SecurityRuleStrategy {
  constructor(private readonly blacklist: ReadonlyArray<string> = ALL_BOTS) {}

  async isViolated(context: RequestContext): Promise<boolean> {
    const client = Client.fromParts(context.identity.ip(), context.identity.ua());

    return this.blacklist.some((bot) => client.hasSameUa(Client.fromParts(undefined, bot)));
  }

  get name(): SecurityRuleNameType {
    return SecurityRuleName.parse("user_agent");
  }
}
