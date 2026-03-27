import { describe, expect, test } from "bun:test";
import { CronExpressionSchedules } from "../src/cron-expression.vo";
import { CronSchedulerNoopAdapter } from "../src/cron-scheduler-noop.adapter";

const cron = new CronSchedulerNoopAdapter();

const task = { label: "crontask", cron: CronExpressionSchedules.EVERY_HOUR, handler: async () => {} };

describe("CronSchedulerNoopAdapter", () => {
  test("schedule", () => {
    expect(() => cron.schedule(task)).not.toThrow();
  });

  test("verify", async () => {
    expect(await cron.verify()).toBe(true);
  });
});
