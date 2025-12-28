import type { SecurityCountermeasureStrategy } from "./security-countermeasure.strategy";
import type { SecurityRuleStrategy } from "./security-rule.strategy";

export class SecurityPolicy {
  constructor(
    readonly rule: SecurityRuleStrategy,
    readonly countermeasure: SecurityCountermeasureStrategy,
  ) {}
}
