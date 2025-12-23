import { createMiddleware } from "hono/factory";
import type { SecurityCountermeasurePort } from "./security-countermeasure.port";
import type { SecurityRulePort } from "./security-rule.port";
import type { ShieldPort } from "./shield.port";

export class ShieldSecurityAdapter implements ShieldPort {
  constructor(
    private readonly rule: SecurityRulePort,
    private readonly countermeasure: SecurityCountermeasurePort,
  ) {}

  verify = createMiddleware(async (c, next) => {
    const violation = await this.rule.check(c);

    if (!violation) await this.countermeasure.execute();

    return next();
  });
}
