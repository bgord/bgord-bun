import type { AbAssignmentStrategy } from "./ab-assignment.strategy";
import type { AbVariant } from "./ab-variant.vo";
import type { AbVariants } from "./ab-variants.vo";
import type { HasRequestCookie } from "./request-context.port";

export class AbAssignmentCookieStrategy implements AbAssignmentStrategy {
  constructor(private readonly name: string) {}

  async assign(context: HasRequestCookie, variants: AbVariants): Promise<AbVariant | undefined> {
    const override = context.request.cookie(this.name);

    return variants.variants.find((v) => v.config.name === override);
  }
}
