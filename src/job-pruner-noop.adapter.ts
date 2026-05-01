import * as tools from "@bgord/tools";
import type { JobPrunerPort } from "./job-pruner.port";

export class JobPrunerNoopAdapter implements JobPrunerPort {
  async prune(_olderThan: tools.Duration): Promise<tools.IntegerNonNegativeType> {
    return tools.Int.nonNegative(1);
  }
}
