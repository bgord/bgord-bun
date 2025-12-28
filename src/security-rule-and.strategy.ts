import type { Context } from "hono";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName } from "./security-rule-name.vo";

export const SecurityRuleAndStrategyError = {
  MissingRules: "security.rule.and.adapter.error.missing.rules",
  MaxRules: "security.rule.and.adapter.error.max.rules",
};

export class SecurityRuleAndStrategy implements SecurityRuleStrategy {
  constructor(private readonly rules: SecurityRuleStrategy[]) {
    if (rules.length === 0) throw new Error(SecurityRuleAndStrategyError.MissingRules);
    if (rules.length > 5) throw new Error(SecurityRuleAndStrategyError.MaxRules);
  }

  async isViolated(c: Context) {
    return this.rules.every((rule) => rule.isViolated(c));
  }

  get name() {
    return SecurityRuleName.parse(`and_${this.rules.map((rule) => rule.name).join("_")}`);
  }
}
