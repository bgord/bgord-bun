import type { AbAssignmentStrategy } from "./ab-assignment.strategy";
import type { AbVariant } from "./ab-variant.vo";
import type { AbVariants } from "./ab-variants.vo";
import type { RequestContext } from "./request-context.port";

export class AbMiddleware {
  constructor(
    private readonly variants: AbVariants,
    private readonly strategy: AbAssignmentStrategy,
  ) {}

  async evaluate(context: RequestContext): Promise<AbVariant | undefined> {
    return this.strategy.assign(context, this.variants);
  }
}
