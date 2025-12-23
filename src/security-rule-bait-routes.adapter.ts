import type { Context } from "hono";
import type { SecurityRulePort } from "./security-rule.port";

export class SecurityRuleBaitRoutesAdapter implements SecurityRulePort {
  constructor(private readonly routes: string[]) {}

  async check(c: Context) {
    return this.routes.includes(c.req.path);
  }
}
