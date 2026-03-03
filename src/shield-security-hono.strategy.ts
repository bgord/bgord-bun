import type { MiddlewareHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import type { SecurityPolicy } from "./security-policy.vo";
import { ShieldSecurityStrategy } from "./shield-security.strategy";
import type { SleeperPort } from "./sleeper.port";

type Dependencies = { Sleeper: SleeperPort };

export const ShieldSecurityHonoStrategyError = {
  Unhandled: "shield.security.hono.strategy.error.unhandled",
};

export class ShieldSecurityHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldSecurityStrategy;

  constructor(
    policies: ReadonlyArray<SecurityPolicy>,
    private readonly deps: Dependencies,
  ) {
    this.strategy = new ShieldSecurityStrategy(policies);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);
      const action = await this.strategy.evaluate(context);

      if (!action) return next();

      switch (action.kind) {
        case "allow":
          return next();

        case "deny":
          return c.text(action.reason, action.response.status as ContentfulStatusCode);

        case "mirage":
          return c.json({}, action.response.status as ContentfulStatusCode);

        case "delay": {
          await this.deps.Sleeper.wait(action.duration);

          switch (action.after.kind) {
            case "allow":
              return next();

            case "deny":
              return c.text(action.after.reason, action.after.response.status as ContentfulStatusCode);

            case "mirage":
              return c.json({}, action.after.response.status as ContentfulStatusCode);

            default:
              throw new Error(ShieldSecurityHonoStrategyError.Unhandled);
          }
        }
      }
    };
  }
}
