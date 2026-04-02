import { describe, expect, spyOn, test } from "bun:test";
import { CronSchedulerNoopAdapter } from "../src/cron-scheduler-noop.adapter";
import { CronSchedulerWithLoggerAdapter } from "../src/cron-scheduler-with-logger.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

const inner = new CronSchedulerNoopAdapter();
const Logger = new LoggerCollectingAdapter();
const adapter = new CronSchedulerWithLoggerAdapter({ Logger, inner });

describe("CronSchedulerWithLoggerAdapter", async () => {
  test("schedule", async () => {
    using innerSchedule = spyOn(inner, "schedule");

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
    using innerVerify = spyOn(inner, "verify");

    await adapter.verify();

    expect(innerVerify).toHaveBeenCalled();
  });
});
