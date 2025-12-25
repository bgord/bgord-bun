import type { SecurityRulePort } from "./security-rule.port";
import { SecurityRuleName } from "./security-rule-name.vo";

export class SecurityRuleFailAdapter implements SecurityRulePort {
  async isViolated() {
    return true;
  }

  get name() {
    return SecurityRuleName.parse("fail");
  }
}
