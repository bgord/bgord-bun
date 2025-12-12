import { describe, expect, spyOn, test } from "bun:test";
import { Cron } from "croner";
import { Jobs } from "../src/jobs.service";

describe("Jobs service", () => {
  test("SCHEDULES", async () => {
    expect(Jobs.SCHEDULES.EVERY_MINUTE).toEqual("* * * * *");
    expect(Jobs.SCHEDULES.EVERY_HOUR).toEqual("0 * * * *");
  });

  test("stopAll", () => {
    const job = new Cron(Jobs.SCHEDULES.EVERY_MINUTE);
    const jobStop = spyOn(job, "stop");

    Jobs.stopAll({ PassageOfTime: job });

    expect(jobStop).toHaveBeenCalled();
  });

  test("areAllRunning", () => {
    const job = new Cron(Jobs.SCHEDULES.EVERY_MINUTE, {}, () => {});

    expect(Jobs.areAllRunning({ PassageOfTime: job })).toEqual(true);

    job.stop();

    expect(Jobs.areAllRunning({ PassageOfTime: job })).toEqual(false);
  });
});
