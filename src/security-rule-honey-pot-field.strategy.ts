import * as v from "valibot";
import type { HasRequestForm, HasRequestJson } from "./request-context.port";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, type SecurityRuleNameType } from "./security-rule-name.vo";

export class SecurityRuleHoneyPotFieldStrategy implements SecurityRuleStrategy {
  constructor(private readonly field: string) {}

  async isViolated(context: HasRequestJson & HasRequestForm): Promise<boolean> {
    const body = await context.request.json();
    const form = await context.request.form();

    const value = body[this.field] ?? form.get(this.field);

    return value !== undefined && value !== null && value !== "";
  }

  get name(): SecurityRuleNameType {
    return v.parse(SecurityRuleName, "honey_pot_field");
  }
}
