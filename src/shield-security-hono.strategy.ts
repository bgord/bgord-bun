import type { MiddlewareHandler } from "hono";
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
          return new Response(action.reason, { status: action.response.status });

        case "mirage":
          return Response.json({}, { status: action.response.status });

        case "delay": {
          await this.deps.Sleeper.wait(action.duration);

          switch (action.after.kind) {
            case "allow":
              return next();

            case "deny":
              return new Response(action.after.reason, { status: action.after.response.status });

            case "mirage":
              return Response.json({}, { status: action.after.response.status });

            default:
              throw new Error(ShieldSecurityHonoStrategyError.Unhandled);
          }
        }
      }
    };
  }
}
