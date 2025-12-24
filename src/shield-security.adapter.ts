import { createMiddleware } from "hono/factory";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Client } from "./client.vo";
import { SecurityContext } from "./security-context.vo";
import type { SecurityPolicy } from "./security-policy.vo";
import type { ShieldPort } from "./shield.port";

export const ShieldSecurityAdapterError = { Unhandled: "shield.security.adapter.error.unhandled" };

export class ShieldSecurityAdapter implements ShieldPort {
  constructor(private readonly policies: SecurityPolicy[]) {}

  verify = createMiddleware(async (c, next) => {
    for (const policy of this.policies) {
      const violation = await policy.rule.isViolated(c);

      if (!violation) return next();

      const context = new SecurityContext(policy.rule.name, Client.fromHonoContext(c), c.get("user")?.id);

      const action = await policy.countermeasure.execute(context);

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
    }
  });
}
