import type { RequestHandler } from "express";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";
import type { SecurityPolicy } from "./security-policy.vo";
import { ShieldSecurityStrategy } from "./shield-security.strategy";
import type { SleeperPort } from "./sleeper.port";

type Dependencies = { Sleeper: SleeperPort };

export const ShieldSecurityExpressStrategyError = {
  Unhandled: "shield.security.express.strategy.error.unhandled",
};

export class ShieldSecurityExpressStrategy implements MiddlewareExpressPort {
  private readonly strategy: ShieldSecurityStrategy;

  constructor(
    policies: ReadonlyArray<SecurityPolicy>,
    private readonly deps: Dependencies,
  ) {
    this.strategy = new ShieldSecurityStrategy(policies);
  }

  handle(): RequestHandler {
    return async (request, response, next) => {
      const context = new RequestContextExpressAdapter(request);
      const action = await this.strategy.evaluate(context);

      if (!action) return next();

      switch (action.kind) {
        case "allow":
          return next();

        case "deny":
          return response.status(action.response.status).send(action.reason);

        case "mirage":
          return response.status(action.response.status).json({});

        case "delay": {
          await this.deps.Sleeper.wait(action.duration);

          switch (action.after.kind) {
            case "allow":
              return next();

            case "deny":
              return response.status(action.after.response.status).send(action.after.reason);

            case "mirage":
              return response.status(action.after.response.status).json({});

            default:
              throw new Error(ShieldSecurityExpressStrategyError.Unhandled);
          }
        }
      }
    };
  }
}
