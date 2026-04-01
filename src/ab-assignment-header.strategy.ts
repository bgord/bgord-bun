import type { AbAssignmentStrategy } from "./ab-assignment.strategy";
import type { AbVariant } from "./ab-variant.vo";
import type { AbVariants } from "./ab-variants.vo";
import type { HasRequestHeader } from "./request-context.port";

export class AbAssignmentHeaderStrategy implements AbAssignmentStrategy {
  constructor(private readonly name: string) {}

  async assign(context: HasRequestHeader, variants: AbVariants): Promise<AbVariant | undefined> {
    const override = context.request.header(this.name);

    return variants.variants.find((v) => v.config.name === override);
  }
}
