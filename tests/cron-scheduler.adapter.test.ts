import { describe, expect, spyOn, test } from "bun:test";
import { CronSchedulerAdapter } from "../src/cron-scheduler.adapter";
import * as mocks from "./mocks";

const adapter = new CronSchedulerAdapter();

describe("CronSchedulerAdapter", () => {
  test("schedule", async () => {
    using bunCron = spyOn(Bun, "cron");

    expect(() => adapter.schedule(mocks.task)).not.toThrow();
    expect(bunCron).toHaveBeenCalledWith(mocks.task.cron, mocks.task.handler);
  });

  test("verify - true", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
