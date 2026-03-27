import { describe, expect, test } from "bun:test";
import { CronSchedulerNoopAdapter } from "../src/cron-scheduler-noop.adapter";
import * as mocks from "./mocks";

const cron = new CronSchedulerNoopAdapter();

describe("CronSchedulerNoopAdapter", () => {
  test("schedule", () => {
    expect(() => cron.schedule(mocks.task)).not.toThrow();
  });

  test("verify", async () => {
    expect(await cron.verify()).toEqual(true);
  });
});
