import { describe, expect, test } from "bun:test";
import { CronSchedulerAdapter } from "../src/cron-scheduler.adapter";
import * as mocks from "./mocks";

const adapter = new CronSchedulerAdapter();

describe("CronSchedulerAdapter", () => {
  test("schedule", async () => {
    expect(() => adapter.schedule(mocks.task)).not.toThrow();
  });

  test("verify - true", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
