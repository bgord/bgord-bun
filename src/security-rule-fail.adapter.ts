import type { SecurityRulePort } from "./security-rule.port";

export class SecurityRuleFailAdapter implements SecurityRulePort {
  async isViolated() {
    return true;
  }

  get name() {
    return "fail";
  }
}
