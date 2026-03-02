import type { AbVariant } from "./ab-variant.vo";
import type { AbVariantSelector } from "./ab-variant-selector.service";
import type { AbVariants } from "./ab-variants.vo";
import type { RequestContext } from "./request-context.port";
import type { SubjectRequestResolver } from "./subject-request-resolver.vo";

export type AbConfig = { name: string; variants: AbVariants; subject: SubjectRequestResolver };

export class AbMiddleware {
  constructor(
    private readonly selector: AbVariantSelector,
    private readonly config: AbConfig,
  ) {}

  async evaluate(context: RequestContext): Promise<AbVariant> {
    const { hex } = await this.config.subject.resolve(context);

    return this.selector.select(hex);
  }
}
