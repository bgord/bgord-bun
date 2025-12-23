import { createMiddleware } from "hono/factory";
import { Client } from "./client.vo";
import type { SecurityCountermeasurePort } from "./security-countermeasure.port";
import type { SecurityRulePort } from "./security-rule.port";
import type { ShieldPort } from "./shield.port";

export class ShieldSecurityAdapter implements ShieldPort {
  constructor(
    private readonly rule: SecurityRulePort,
    private readonly countermeasure: SecurityCountermeasurePort,
  ) {}

  verify = createMiddleware(async (c, next) => {
    const context = { client: Client.fromHonoContext(c) };

    const violation = await this.rule.check(c);

    if (violation) await this.countermeasure.execute(context);

    return next();
  });
}
