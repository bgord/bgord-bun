import type { AbVariant } from "./ab-variant.vo";
import type { RequestContext } from "./request-context.port";

export interface AbAssignmentStrategy {
  assign(context: RequestContext): Promise<AbVariant | undefined>;
}
