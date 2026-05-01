import type * as tools from "@bgord/tools";

export interface JobPrunerPort {
  prune(olderThan: tools.Duration): Promise<tools.IntegerNonNegativeType>;
}
