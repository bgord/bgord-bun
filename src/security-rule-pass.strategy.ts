import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, type SecurityRuleNameType } from "./security-rule-name.vo";

export class SecurityRulePassStrategy implements SecurityRuleStrategy {
  async isViolated(): Promise<boolean> {
    return false;
  }

  get name(): SecurityRuleNameType {
    return SecurityRuleName.parse("pass");
  }
}
