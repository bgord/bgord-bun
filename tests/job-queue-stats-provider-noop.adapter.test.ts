import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobQueueStatsProviderNoopAdapter } from "../src/job-queue-stats-provider-noop.adapter";

const zero = tools.Int.nonNegative(0);
const adapter = new JobQueueStatsProviderNoopAdapter();

describe("JobQueueStatsProviderNoopAdapter", () => {
  test("getStats", async () => {
    expect(await adapter.getStats()).toEqual({
      pending: zero,
      claimed: zero,
      completed: zero,
      failed: zero,
      oldestPending: null,
    });
  });
});
