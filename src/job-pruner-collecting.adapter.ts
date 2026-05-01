import * as tools from "@bgord/tools";
import type { JobPrunerPort } from "./job-pruner.port";

export class JobPrunerCollectingAdapter implements JobPrunerPort {
  readonly pruned: Array<[tools.Duration, tools.IntegerNonNegativeType]> = [];

  async prune(olderThan: tools.Duration): Promise<tools.IntegerNonNegativeType> {
    const count = tools.Int.nonNegative(0);

    this.pruned.push([olderThan, count]);

    return count;
  }
}
