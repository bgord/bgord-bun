import type { RequestContext } from "./request-context.port";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, type SecurityRuleNameType } from "./security-rule-name.vo";

export const SecurityRuleOrStrategyError = {
  MissingRules: "security.rule.or.adapter.error.missing.rules",
  MaxRules: "security.rule.or.adapter.error.max.rules",
};

export class SecurityRuleOrStrategy implements SecurityRuleStrategy {
  constructor(private readonly rules: SecurityRuleStrategy[]) {
    if (rules.length === 0) throw new Error(SecurityRuleOrStrategyError.MissingRules);
    if (rules.length > 5) throw new Error(SecurityRuleOrStrategyError.MaxRules);
  }

  async isViolated(context: RequestContext): Promise<boolean> {
    const reports = await Promise.all(this.rules.map((rule) => rule.isViolated(context)));

    return reports.some(Boolean);
  }

  get name(): SecurityRuleNameType {
    return SecurityRuleName.parse(`or_${this.rules.map((rule) => rule.name).join("_")}`);
  }
}
