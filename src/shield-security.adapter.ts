import { createMiddleware } from "hono/factory";
import { Client } from "./client.vo";
import type { SecurityContext } from "./security-context.types";
import type { SecurityCountermeasurePort } from "./security-countermeasure.port";
import type { SecurityRulePort } from "./security-rule.port";
import type { ShieldPort } from "./shield.port";

export class ShieldSecurityAdapter implements ShieldPort {
  constructor(
    private readonly rule: SecurityRulePort,
    private readonly countermeasure: SecurityCountermeasurePort,
  ) {}

  verify = createMiddleware(async (c, next) => {
    const context: SecurityContext = {
      rule: this.rule.name,
      client: Client.fromHonoContext(c),
      userId: c.get("user")?.id,
    };

    const violation = await this.rule.isViolated(c);

    if (violation) await this.countermeasure.execute(context);
    return next();
  });
}
