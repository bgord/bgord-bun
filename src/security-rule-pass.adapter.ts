import type { SecurityRulePort } from "./security-rule.port";
import { SecurityRuleName } from "./security-rule-name.vo";

export class SecurityRulePassAdapter implements SecurityRulePort {
  async isViolated() {
    return false;
  }

  get name() {
    return SecurityRuleName.parse("pass");
  }
}
