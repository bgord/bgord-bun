import { createMiddleware } from "hono/factory";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Client } from "./client.vo";
import { SecurityContext } from "./security-context.vo";
import type { SecurityCountermeasurePort } from "./security-countermeasure.port";
import type { SecurityRulePort } from "./security-rule.port";
import type { ShieldPort } from "./shield.port";

export const ShieldSecurityAdapterError = { Unhandled: "shield.security.adapter.error.unhandled" };

export class ShieldSecurityAdapter implements ShieldPort {
  constructor(
    private readonly rule: SecurityRulePort,
    private readonly countermeasure: SecurityCountermeasurePort,
  ) {}

  verify = createMiddleware(async (c, next) => {
    const context = new SecurityContext(this.rule.name, Client.fromHonoContext(c), c.get("user")?.id);

    const violation = await this.rule.isViolated(c);

    if (!violation) return next();

    const action = await this.countermeasure.execute(context);

    switch (action.kind) {
      case "allow":
        return next();

      case "deny":
        return c.text(action.reason, action.response.status as ContentfulStatusCode);

      case "mirage":
        return c.json({}, action.response.status as ContentfulStatusCode);

      case "delay": {
        await Bun.sleep(action.duration.ms);

        switch (action.after.kind) {
          case "allow":
            return next();

          case "deny":
            return c.text(action.after.reason, action.after.response.status as ContentfulStatusCode);

          case "mirage":
            return c.json({}, action.after.response.status as ContentfulStatusCode);

          case "delay":
            throw new Error(ShieldSecurityAdapterError.Unhandled);

          default:
            throw new Error(ShieldSecurityAdapterError.Unhandled);
        }
      }
    }
  });
}
