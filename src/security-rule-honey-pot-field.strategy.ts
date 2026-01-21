import type { Context } from "hono";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, type SecurityRuleNameType } from "./security-rule-name.vo";

export class SecurityRuleHoneyPotFieldStrategy implements SecurityRuleStrategy {
  constructor(private readonly field: string) {}

  async isViolated(c: Context): Promise<boolean> {
    const request = c.req.raw.clone();

    const body = await request.json().catch(() => ({}));
    const value = body[this.field];

    return value !== undefined && value !== null && value !== "";
  }

  get name(): SecurityRuleNameType {
    return SecurityRuleName.parse("honey_pot_field");
  }
}
