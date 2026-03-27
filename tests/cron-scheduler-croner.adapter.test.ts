import { describe, expect, spyOn, test } from "bun:test";
import {
  CronSchedulerCronerAdapter,
  CronSchedulerCronerAdapterError,
} from "../src/cron-scheduler-croner.adapter";
import * as mocks from "./mocks";

describe("CronSchedulerCronerAdapter", () => {
  test("schedule", async () => {
    const scheduler = await CronSchedulerCronerAdapter.build();

    expect(() => scheduler.schedule(mocks.task)).not.toThrow();
  });

  test("verify - true", async () => {
    const scheduler = await CronSchedulerCronerAdapter.build();

    scheduler.schedule(mocks.task);

    expect(await scheduler.verify()).toEqual(true);
  });

  test("verify - false", async () => {
    const scheduler = await CronSchedulerCronerAdapter.build();

    expect(await scheduler.verify()).toEqual(false);
  });

  test("missing dependency", async () => {
    // @ts-expect-error Private method
    using _ = spyOn(CronSchedulerCronerAdapter["importer"], "import").mockImplementation(
      mocks.throwIntentionalErrorAsync,
    );

    expect(async () => CronSchedulerCronerAdapter.build()).toThrow(
      CronSchedulerCronerAdapterError.MissingDependency,
    );
  });

  test("import", async () => {
    // @ts-expect-error Private method
    using obfuscate = spyOn(CronSchedulerCronerAdapter["importer"], "obfuscate");

    await CronSchedulerCronerAdapter.build();

    expect(obfuscate).toHaveBeenCalledWith("croner");
  });
});
