import type { AbAssignmentStrategy } from "./ab-assignment.strategy";
import type { AbVariant } from "./ab-variant.vo";
import type { RequestContext } from "./request-context.port";

export class AbMiddleware {
  constructor(private readonly strategy: AbAssignmentStrategy) {}

  async evaluate(context: RequestContext): Promise<AbVariant | undefined> {
    return this.strategy.assign(context);
  }
}
