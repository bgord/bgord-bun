import type { SecurityRulePort } from "./security-rule.port";

export class SecurityRuleNoopAdapter implements SecurityRulePort {
  async isViolated() {
    return false;
  }

  get name() {
    return "noop";
  }
}
