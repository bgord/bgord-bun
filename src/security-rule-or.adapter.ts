import type { Context } from "hono";
import type { SecurityRulePort } from "./security-rule.port";

export const SecurityRuleOrAdapterError = {
  MissingRules: "security.rule.or.adapter.error.missing.rules",
};

export class SecurityRuleOrAdapter implements SecurityRulePort {
  constructor(private readonly rules: SecurityRulePort[]) {
    if (rules.length === 0) throw new Error(SecurityRuleOrAdapterError.MissingRules);
  }

  async isViolated(c: Context) {
    return this.rules.some((rule) => rule.isViolated(c));
  }

  get name() {
    return `or_${this.rules.map((rule) => rule.name).join("_")}`;
  }
}
