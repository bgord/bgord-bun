import { Client } from "./client.vo";
import type { HasIdentityIp, HasIdentityUa, HasIdentityUserId, RequestContext } from "./request-context.port";
import { SecurityContext } from "./security-context.vo";
import type { SecurityAction } from "./security-countermeasure.strategy";
import type { SecurityPolicy } from "./security-policy.vo";

export const ShieldSecurityStrategyError = {
  MissingPolicies: "shield.security.strategy.error.missing.policies",
  MaxPolicies: "shield.security.strategy.error.max.policies",
};

export class ShieldSecurityStrategy {
  constructor(private readonly policies: ReadonlyArray<SecurityPolicy>) {
    if (policies.length === 0) throw new Error(ShieldSecurityStrategyError.MissingPolicies);
    if (policies.length > 5) throw new Error(ShieldSecurityStrategyError.MaxPolicies);
  }

  async evaluate(
    context: RequestContext & HasIdentityIp & HasIdentityUa & HasIdentityUserId,
  ): Promise<SecurityAction | null> {
    for (const policy of this.policies) {
      const violation = await policy.rule.isViolated(context);

      if (!violation) continue;

      const securityContext = new SecurityContext(
        policy.rule.name,
        policy.countermeasure.name,
        Client.fromParts(context.identity.ip(), context.identity.ua()),
        context.identity.userId(),
      );

      return await policy.countermeasure.execute(securityContext);
    }

    return null;
  }
}
