import { describe, expect, spyOn, test } from "bun:test";
import { CronSchedulerNoopAdapter } from "../src/cron-scheduler-noop.adapter";
import { CronSchedulerWithLoggerAdapter } from "../src/cron-scheduler-with-logger.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

describe("CronSchedulerWithLoggerAdapter", async () => {
  test("schedule", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new CronSchedulerNoopAdapter();
    using innerSchedule = spyOn(inner, "schedule");
    const adapter = new CronSchedulerWithLoggerAdapter({ Logger, inner });

    adapter.schedule(mocks.task);

    expect(innerSchedule).toHaveBeenCalledWith(mocks.task);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: "Cron scheduler schedule",
        operation: "cron_scheduler_schedule",
        metadata: { label: mocks.task.label, cron: mocks.task.cron },
      },
    ]);
  });

  test("verify", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new CronSchedulerNoopAdapter();
    const adapter = new CronSchedulerWithLoggerAdapter({ Logger, inner });

    expect(await adapter.verify()).toEqual(true);
    expect(Logger.entries).toEqual([]);
  });
});
