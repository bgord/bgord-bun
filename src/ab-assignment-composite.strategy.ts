import type { AbAssignmentStrategy } from "./ab-assignment.strategy";
import type { AbVariant } from "./ab-variant.vo";
import type { AbVariants } from "./ab-variants.vo";
import type { RequestContext } from "./request-context.port";

export class AbAssignmentCompositeStrategy implements AbAssignmentStrategy {
  constructor(private readonly strategies: ReadonlyArray<AbAssignmentStrategy>) {}

  async assign(context: RequestContext, variants: AbVariants): Promise<AbVariant | undefined> {
    for (const strategy of this.strategies) {
      const variant = await strategy.assign(context, variants);

      if (variant) return variant;
    }
    return undefined;
  }
}
