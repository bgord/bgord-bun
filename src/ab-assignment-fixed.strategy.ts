import type { AbAssignmentStrategy } from "./ab-assignment.strategy";
import type { AbVariant } from "./ab-variant.vo";
import type { AbVariants } from "./ab-variants.vo";
import type { RequestContext } from "./request-context.port";

export class AbAssignmentFixedStrategy implements AbAssignmentStrategy {
  constructor(private readonly variant: AbVariant) {}

  async assign(_context: RequestContext, _variants: AbVariants): Promise<AbVariant> {
    return this.variant;
  }
}
