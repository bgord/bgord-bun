import type { RequestContext } from "./request-context.port";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, type SecurityRuleNameType } from "./security-rule-name.vo";

export class SecurityRuleHoneyPotFieldStrategy implements SecurityRuleStrategy {
  constructor(private readonly field: string) {}

  async isViolated(context: RequestContext): Promise<boolean> {
    const body = await context.request.json();

    const value = body[this.field];

    return value !== undefined && value !== null && value !== "";
  }

  get name(): SecurityRuleNameType {
    return SecurityRuleName.parse("honey_pot_field");
  }
}
