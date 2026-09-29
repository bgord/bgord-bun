import { describe, expect, spyOn, test } from "bun:test";
import { CronSchedulerAdapter } from "../src/cron-scheduler.adapter";
import * as mocks from "./mocks";

const adapter = new CronSchedulerAdapter();

describe("CronSchedulerAdapter", () => {
  test("schedule", async () => {
    using bunCron = spyOn(Bun, "cron");

    expect(() => adapter.schedule(mocks.task)).not.toThrow();
    expect(bunCron).toHaveBeenCalledWith(mocks.task.cron, expect.any(Function));
  });

  test("schedule - handler", async () => {
    using bunCron = spyOn(Bun, "cron").mockReturnValue({} as Bun.CronJob);
    using taskHandler = spyOn(mocks.task, "handler");
    new CronSchedulerAdapter().schedule(mocks.task);

    await bunCron.mock.calls[0]?.[1]();

    expect(taskHandler).toHaveBeenCalledTimes(1);
  });

  test("schedule - handler failure", async () => {
    using bunCron = spyOn(Bun, "cron").mockReturnValue({} as Bun.CronJob);
    using _ = spyOn(mocks.task, "handler").mockImplementation(mocks.throwIntentionalErrorAsync);
    new CronSchedulerAdapter().schedule(mocks.task);

    const result = await bunCron.mock.calls[0]?.[1]();

    expect(result).toEqual(undefined);
  });

  test("verify - true", async () => {
    expect(await adapter.verify()).toEqual(true);
  });

  test("verify - false", async () => {
    expect(await new CronSchedulerAdapter().verify()).toEqual(false);
  });
});
