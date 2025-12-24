import type { SecurityRulePort } from "./security-rule.port";

export class SecurityRulePassAdapter implements SecurityRulePort {
  async isViolated() {
    return false;
  }

  get name() {
    return "pass";
  }
}
