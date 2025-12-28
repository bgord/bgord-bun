import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName } from "./security-rule-name.vo";

export class SecurityRulePassStrategy implements SecurityRuleStrategy {
  async isViolated() {
    return false;
  }

  get name() {
    return SecurityRuleName.parse("pass");
  }
}
