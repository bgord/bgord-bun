import type { Context } from "hono";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, SecurityRuleNameType } from "./security-rule-name.vo";

export class SecurityRuleBaitRoutesStrategy implements SecurityRuleStrategy {
  constructor(private readonly routes: string[]) {}

  async isViolated(c: Context): Promise<boolean> {
    return this.routes.includes(c.req.path);
  }

  get name(): SecurityRuleNameType {
    return SecurityRuleName.parse("bait_routes");
  }
}
