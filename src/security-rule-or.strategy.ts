import type { Context } from "hono";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName } from "./security-rule-name.vo";

export const SecurityRuleOrStrategyError = {
  MissingRules: "security.rule.or.adapter.error.missing.rules",
  MaxRules: "security.rule.or.adapter.error.max.rules",
};

export class SecurityRuleOrStrategy implements SecurityRuleStrategy {
  constructor(private readonly rules: SecurityRuleStrategy[]) {
    if (rules.length === 0) throw new Error(SecurityRuleOrStrategyError.MissingRules);
    if (rules.length > 5) throw new Error(SecurityRuleOrStrategyError.MaxRules);
  }

  async isViolated(c: Context) {
    return this.rules.some((rule) => rule.isViolated(c));
  }

  get name() {
    return SecurityRuleName.parse(`or_${this.rules.map((rule) => rule.name).join("_")}`);
  }
}
