import { describe, expect, spyOn, test } from "bun:test";
import { CronSchedulerNoopAdapter } from "../src/cron-scheduler-noop.adapter";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierCronSchedulerAdapter } from "../src/prerequisite-verifier-cron-scheduler.adapter";

const CronScheduler = new CronSchedulerNoopAdapter();

describe("PrerequisiteVerifierCronSchedulerAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierCronSchedulerAdapter({ CronScheduler });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure", async () => {
    using _ = spyOn(CronScheduler, "verify").mockResolvedValue(false);
    const prerequisite = new PrerequisiteVerifierCronSchedulerAdapter({ CronScheduler });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure());
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierCronSchedulerAdapter({ CronScheduler });

    expect(prerequisite.kind).toEqual("cron-scheduler");
  });
});
