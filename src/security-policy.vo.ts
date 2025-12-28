import type { SecurityCountermeasurePort } from "./security-countermeasure.port";
import type { SecurityRuleStrategy } from "./security-rule.strategy";

export class SecurityPolicy {
  constructor(
    readonly rule: SecurityRuleStrategy,
    readonly countermeasure: SecurityCountermeasurePort,
  ) {}
}
