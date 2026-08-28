import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { CronSchedulerNoopAdapter } from "../src/cron-scheduler-noop.adapter";
import { CronSchedulerWithLoggerAdapter } from "../src/cron-scheduler-with-logger.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("CronSchedulerWithLoggerAdapter", async () => {
  test("schedule - success", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new CronSchedulerNoopAdapter();
    using innerSchedule = spyOn(inner, "schedule");
    const adapter = new CronSchedulerWithLoggerAdapter({ Logger, inner, Clock });

    CorrelationStorage.run(mocks.correlationId, () => adapter.schedule(mocks.task));

    expect(innerSchedule).toHaveBeenCalledWith(mocks.task);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "cron_scheduler",
        message: "Cron scheduler schedule attempt",
        correlationId: mocks.correlationId,
        metadata: { label: mocks.task.label, cron: mocks.task.cron },
      },
      {
        component: "infra",
        operation: "cron_scheduler",
        message: "Cron scheduler schedule success",
        correlationId: mocks.correlationId,
        metadata: {
          label: mocks.task.label,
          cron: mocks.task.cron,
          duration: expect.any(tools.Duration),
        },
      },
    ]);
  });

  test("schedule - failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new CronSchedulerNoopAdapter();
    using _ = spyOn(inner, "schedule").mockImplementation(mocks.throwIntentionalError);
    const adapter = new CronSchedulerWithLoggerAdapter({ Logger, inner, Clock });

    expect(() => CorrelationStorage.run(mocks.correlationId, () => adapter.schedule(mocks.task))).toThrow(
      mocks.IntentionalError,
    );
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "cron_scheduler",
        message: "Cron scheduler schedule attempt",
        correlationId: mocks.correlationId,
        metadata: { label: mocks.task.label, cron: mocks.task.cron },
      },
      {
        component: "infra",
        operation: "cron_scheduler",
        message: "Cron scheduler schedule error",
        correlationId: mocks.correlationId,
        error: new Error(mocks.IntentionalError),
        metadata: {
          label: mocks.task.label,
          cron: mocks.task.cron,
          duration: expect.any(tools.Duration),
        },
      },
    ]);
  });

  test("verify", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new CronSchedulerNoopAdapter();
    const adapter = new CronSchedulerWithLoggerAdapter({ Logger, inner, Clock });

    expect(await adapter.verify()).toEqual(true);
    expect(Logger.entries).toEqual([]);
  });
});
