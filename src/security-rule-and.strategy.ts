import type { RequestContext } from "./request-context.port";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, type SecurityRuleNameType } from "./security-rule-name.vo";

export const SecurityRuleAndStrategyError = {
  MissingRules: "security.rule.and.adapter.error.missing.rules",
  MaxRules: "security.rule.and.adapter.error.max.rules",
};

export class SecurityRuleAndStrategy implements SecurityRuleStrategy {
  constructor(private readonly rules: ReadonlyArray<SecurityRuleStrategy>) {
    if (rules.length === 0) throw new Error(SecurityRuleAndStrategyError.MissingRules);
    if (rules.length > 5) throw new Error(SecurityRuleAndStrategyError.MaxRules);
  }

  async isViolated(context: RequestContext): Promise<boolean> {
    const reports = await Promise.all(this.rules.map((rule) => rule.isViolated(context)));

    return reports.every(Boolean);
  }

  get name(): SecurityRuleNameType {
    return SecurityRuleName.parse(`and_${this.rules.map((rule) => rule.name).join("_")}`);
  }
}
