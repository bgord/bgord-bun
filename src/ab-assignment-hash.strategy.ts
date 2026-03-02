import type { AbAssignmentStrategy } from "./ab-assignment.strategy";
import type { AbVariant } from "./ab-variant.vo";
import { AbVariantSelector } from "./ab-variant-selector.service";
import type { AbVariants } from "./ab-variants.vo";
import type { RequestContext } from "./request-context.port";
import type { SubjectRequestResolver } from "./subject-request-resolver.vo";

export class AbAssignmentHashStrategy implements AbAssignmentStrategy {
  private readonly selector: AbVariantSelector;

  constructor(
    private readonly variants: AbVariants,
    private readonly subject: SubjectRequestResolver,
  ) {
    this.selector = new AbVariantSelector(variants);
  }

  async assign(context: RequestContext, _variants: AbVariants): Promise<AbVariant> {
    const { hex } = await this.subject.resolve(context);

    return this.selector.select(hex);
  }
}
