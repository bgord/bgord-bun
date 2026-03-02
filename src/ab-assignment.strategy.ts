import type { AbVariant } from "./ab-variant.vo";
import type { AbVariants } from "./ab-variants.vo";
import type { RequestContext } from "./request-context.port";

export interface AbAssignmentStrategy {
  assign(context: RequestContext, variants: AbVariants): Promise<AbVariant>;
}
