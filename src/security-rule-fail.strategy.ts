import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, type SecurityRuleNameType } from "./security-rule-name.vo";

export class SecurityRuleFailStrategy implements SecurityRuleStrategy {
  async isViolated(): Promise<boolean> {
    return true;
  }

  get name(): SecurityRuleNameType {
    return SecurityRuleName.parse("fail");
  }
}
