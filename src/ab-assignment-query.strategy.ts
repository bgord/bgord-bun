import type { AbAssignmentStrategy } from "./ab-assignment.strategy";
import type { AbVariant } from "./ab-variant.vo";
import type { AbVariants } from "./ab-variants.vo";
import type { HasRequestQuery } from "./request-context.port";

export class AbAssignmentQueryStrategy implements AbAssignmentStrategy {
  constructor(private readonly parameter: string) {}

  async assign(context: HasRequestQuery, variants: AbVariants): Promise<AbVariant | undefined> {
    const override = context.request.query()[this.parameter];

    return variants.variants.find((v) => v.config.name === override);
  }
}
