import type * as tools from "@bgord/tools";

export type JobQueueStatsSnapshot = {
  pending: tools.IntegerNonNegativeType;
  claimed: tools.IntegerNonNegativeType;
  completed: tools.IntegerNonNegativeType;
  failed: tools.IntegerNonNegativeType;
  oldestPending: tools.TimestampValueType | null;
};

export interface JobQueueStatsProviderPort {
  getStats(): Promise<JobQueueStatsSnapshot>;
}
