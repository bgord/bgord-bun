import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName } from "./security-rule-name.vo";

export class SecurityRuleFailStrategy implements SecurityRuleStrategy {
  async isViolated() {
    return true;
  }

  get name() {
    return SecurityRuleName.parse("fail");
  }
}
