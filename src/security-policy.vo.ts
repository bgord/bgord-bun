import type { SecurityCountermeasurePort } from "./security-countermeasure.port";
import type { SecurityRulePort } from "./security-rule.port";

export class SecurityPolicy {
  constructor(
    readonly rule: SecurityRulePort,
    readonly countermeasure: SecurityCountermeasurePort,
  ) {}

  get name() {
    return `${this.rule.name}_triggers_${this.countermeasure.name}`;
  }
}
