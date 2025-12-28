import type { Context } from "hono";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName } from "./security-rule-name.vo";

export class SecurityRuleBaitRoutesStrategy implements SecurityRuleStrategy {
  constructor(private readonly routes: string[]) {}

  async isViolated(c: Context) {
    return this.routes.includes(c.req.path);
  }

  get name() {
    return SecurityRuleName.parse("bait_routes");
  }
}
