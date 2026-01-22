import type { HasRequestPath } from "./request-context.port";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, type SecurityRuleNameType } from "./security-rule-name.vo";

export class SecurityRuleBaitRoutesStrategy implements SecurityRuleStrategy {
  constructor(private readonly routes: string[]) {}

  async isViolated(context: HasRequestPath): Promise<boolean> {
    return this.routes.includes(context.request.path);
  }

  get name(): SecurityRuleNameType {
    return SecurityRuleName.parse("bait_routes");
  }
}
