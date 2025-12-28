import { createMiddleware } from "hono/factory";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ClientFromHono } from "./client-from-hono.adapter";
import { SecurityContext } from "./security-context.vo";
import type { SecurityPolicy } from "./security-policy.vo";
import type { ShieldStrategy } from "./shield.strategy";

export const ShieldSecurityAdapterError = {
  Unhandled: "shield.security.adapter.error.unhandled",
  MissingPolicies: "shield.security.adapter.error.missing.policies",
  MaxPolicies: "shield.security.adapter.error.max.policies",
};

export class ShieldSecurityStrategy implements ShieldStrategy {
  constructor(private readonly policies: SecurityPolicy[]) {
    if (policies.length === 0) throw new Error(ShieldSecurityAdapterError.MissingPolicies);
    if (policies.length > 5) throw new Error(ShieldSecurityAdapterError.MaxPolicies);
  }

  verify = createMiddleware(async (c, next) => {
    for (const policy of this.policies) {
      const violation = await policy.rule.isViolated(c);

      if (!violation) continue;

      const context = new SecurityContext(policy.rule.name, ClientFromHono.translate(c), c.get("user")?.id);

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

    return next();
  });
}
