import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { JobQueueStatsProviderNoopAdapter } from "../src/job-queue-stats-provider-noop.adapter";
import { PrerequisiteVerification, PrerequisiteVerificationOutcome } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierJobQueueLagAdapter } from "../src/prerequisite-verifier-job-queue-lag.adapter";
import * as mocks from "./mocks";

const maximum = tools.Duration.Minutes(15);

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const JobQueueStatsProvider = new JobQueueStatsProviderNoopAdapter();
const deps = { Clock, JobQueueStatsProvider };

const prerequisite = new PrerequisiteVerifierJobQueueLagAdapter({ maximum }, deps);

const zero = tools.Int.nonNegative(0);
const stats = { pending: tools.Int.nonNegative(1), claimed: zero, completed: zero, failed: zero };

describe("PrerequisiteVerifierJobQueueLagAdapter", () => {
  test("success", async () => {
    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("success - lag equals the maximum", async () => {
    using _ = spyOn(JobQueueStatsProvider, "getStats").mockResolvedValue({
      ...stats,
      oldestPending: mocks.TIME_ZERO.subtract(maximum).ms,
    });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - lag", async () => {
    using _ = spyOn(JobQueueStatsProvider, "getStats").mockResolvedValue({
      ...stats,
      oldestPending: mocks.TIME_ZERO.subtract(tools.Duration.Minutes(16)).ms,
    });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("Lag: 960s"));
  });

  test("failure - job queue stats provider", async () => {
    using _ = spyOn(JobQueueStatsProvider, "getStats").mockImplementation(mocks.throwIntentionalErrorAsync);

    const result = await prerequisite.verify();

    expect(result.outcome).toEqual(PrerequisiteVerificationOutcome.failure);
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("job-queue-lag");
  });
});
