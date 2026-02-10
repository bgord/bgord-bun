import { describe, expect, spyOn, test } from "bun:test";
import { Jobs } from "../src/jobs.service";

describe("Jobs service", () => {
  test("SCHEDULES", async () => {
    expect(Jobs.SCHEDULES.EVERY_MINUTE).toEqual("* * * * *");
    expect(Jobs.SCHEDULES.EVERY_HOUR).toEqual("0 * * * *");
  });

  test("stopAll", () => {
    const job = { stop: () => {}, isRunning: () => true };
    using jobStop = spyOn(job, "stop");

    Jobs.stopAll({ PassageOfTime: job });

    expect(jobStop).toHaveBeenCalled();
  });

  test("areAllRunning", () => {
    let running = true;
    // biome-ignore lint: lint/suspicious/noAssignInExpressions
    const job = { stop: () => (running = false), isRunning: () => running };

    expect(Jobs.areAllRunning({ PassageOfTime: job })).toEqual(true);

    job.stop();

    expect(Jobs.areAllRunning({ PassageOfTime: job })).toEqual(false);
  });
});
