import type { Context } from "hono";
import type { SecurityRulePort } from "./security-rule.port";

export const SecurityRuleAndAdapterError = {
  MissingRules: "security.rule.and.adapter.error.missing.rules",
  MaxRules: "security.rule.and.adapter.error.max.rules",
};

export class SecurityRuleAndAdapter implements SecurityRulePort {
  constructor(private readonly rules: SecurityRulePort[]) {
    if (rules.length === 0) throw new Error(SecurityRuleAndAdapterError.MissingRules);
    if (rules.length > 5) throw new Error(SecurityRuleAndAdapterError.MaxRules);
  }

  async isViolated(c: Context) {
    return this.rules.every((rule) => rule.isViolated(c));
  }

  get name() {
    return `and_${this.rules.map((rule) => rule.name).join("_")}`;
  }
}
