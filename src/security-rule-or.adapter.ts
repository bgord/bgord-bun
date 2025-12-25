import type { Context } from "hono";
import type { SecurityRulePort } from "./security-rule.port";
import { SecurityRuleName } from "./security-rule-name.vo";

export const SecurityRuleOrAdapterError = {
  MissingRules: "security.rule.or.adapter.error.missing.rules",
  MaxRules: "security.rule.or.adapter.error.max.rules",
};

export class SecurityRuleOrAdapter implements SecurityRulePort {
  constructor(private readonly rules: SecurityRulePort[]) {
    if (rules.length === 0) throw new Error(SecurityRuleOrAdapterError.MissingRules);
    if (rules.length > 5) throw new Error(SecurityRuleOrAdapterError.MaxRules);
  }

  async isViolated(c: Context) {
    return this.rules.some((rule) => rule.isViolated(c));
  }

  get name() {
    return SecurityRuleName.parse(`or_${this.rules.map((rule) => rule.name).join("_")}`);
  }
}
