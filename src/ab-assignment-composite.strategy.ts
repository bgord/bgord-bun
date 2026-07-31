import type { AbAssignmentStrategy } from "./ab-assignment.strategy";
import type { AbVariant } from "./ab-variant.vo";
import type { RequestContext } from "./request-context.port";

export const AbAssignmentCompositeError = { NoStrategies: "ab.assignment.composite.strategies.min" };

export class AbAssignmentCompositeStrategy implements AbAssignmentStrategy {
  constructor(private readonly strategies: ReadonlyArray<AbAssignmentStrategy>) {
    if (this.strategies.length === 0) throw new Error(AbAssignmentCompositeError.NoStrategies);
  }

  async assign(context: RequestContext): Promise<AbVariant | undefined> {
    for (const strategy of this.strategies) {
      const variant = await strategy.assign(context);

      if (variant) return variant;
    }
    return undefined;
  }
}
