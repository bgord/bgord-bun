import type { AbAssignmentStrategy } from "./ab-assignment.strategy";
import type { AbVariant } from "./ab-variant.vo";
import type { AbVariants } from "./ab-variants.vo";
import type { RequestContext } from "./request-context.port";

export class AbAssignmentOverrideQueryStrategy implements AbAssignmentStrategy {
  constructor(private readonly parameter: string) {}

  async assign(context: RequestContext, variants: AbVariants): Promise<AbVariant | undefined> {
    const override = context.request.query()[this.parameter];

    if (!override) return undefined;
    return variants.variants.find((v) => v.config.name === override);
  }
}
