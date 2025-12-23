import type { SecurityRulePort } from "./security-rule.port";

export class SecurityRuleNoopAdapter implements SecurityRulePort {
  async check() {
    return true;
  }
}
