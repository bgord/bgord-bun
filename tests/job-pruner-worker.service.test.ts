import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CronExpressionSchedules } from "../src/cron-expression.vo";
import { JobPrunerCollectingAdapter } from "../src/job-pruner-collecting.adapter";
import { JobPrunerWorker } from "../src/job-pruner-worker.service";

const olderThan = tools.Duration.Days(30);
const config = { label: "JobPruner", cron: CronExpressionSchedules.EVERY_MINUTE, olderThan };

describe("JobPrunerWorker", () => {
  test("config", () => {
    const JobPruner = new JobPrunerCollectingAdapter();
    const task = JobPrunerWorker(config, { JobPruner });

    expect(task.label).toEqual(config.label);
    expect(task.cron).toEqual(config.cron);
  });

  test("prune", async () => {
    const JobPruner = new JobPrunerCollectingAdapter();
    const task = JobPrunerWorker(config, { JobPruner });

    await task.handler();

    expect(JobPruner.pruned).toEqual([[olderThan, tools.Int.nonNegative(0)]]);
  });
});
