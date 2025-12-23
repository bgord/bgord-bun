import { createMiddleware } from "hono/factory";
import { Client } from "./client.vo";
import { SecurityContext } from "./security-context.vo";
import type { SecurityCountermeasurePort } from "./security-countermeasure.port";
import type { SecurityRulePort } from "./security-rule.port";
import type { ShieldPort } from "./shield.port";

export class ShieldSecurityAdapter implements ShieldPort {
  constructor(
    private readonly rule: SecurityRulePort,
    private readonly countermeasure: SecurityCountermeasurePort,
  ) {}

  verify = createMiddleware(async (c, next) => {
    const context = new SecurityContext(this.rule.name, Client.fromHonoContext(c), c.get("user")?.id);

    const violation = await this.rule.isViolated(c);

    if (!violation) return next();
    await this.countermeasure.execute(context);
  });
}
