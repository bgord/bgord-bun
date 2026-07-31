import type { AbAssignmentStrategy } from "./ab-assignment.strategy";
import type { AbVariant } from "./ab-variant.vo";
import type { RequestContext } from "./request-context.port";

export class AbAssignmentCompositeStrategy implements AbAssignmentStrategy {
  constructor(private readonly strategies: ReadonlyArray<AbAssignmentStrategy>) {}

  async assign(context: RequestContext): Promise<AbVariant | undefined> {
    for (const strategy of this.strategies) {
      const variant = await strategy.assign(context);

      if (variant) return variant;
    }
    return undefined;
  }
}
