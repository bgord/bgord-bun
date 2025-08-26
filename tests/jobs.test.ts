import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as croner from "croner";
import { JobHandler, Jobs, UTC_DAY_OF_THE_WEEK } from "../src/jobs.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

const logger = new LoggerNoopAdapter();

describe("JobHandler", () => {
  test("should log job start and success when job is processed successfully", async () => {
    // @ts-expect-error
    spyOn(croner, "Cron").mockImplementation(() => ({
      isRunning: jest.fn().mockReturnValue(false),
      stop: jest.fn(),
    }));
    const loggerInfoSpy = spyOn(logger, "info").mockImplementation(jest.fn());

    const jobHandler = new JobHandler(logger);

    const job = jobHandler.handle({
      cron: "* * * * *",
      label: "Test Job",
      process: jest.fn().mockResolvedValue(undefined),
    });
    await job();
    expect(loggerInfoSpy).toHaveBeenNthCalledWith(1, expect.objectContaining({ message: "Test Job start" }));
    expect(loggerInfoSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ message: "Test Job success" }),
    );
  });

  test("should log job error when job fails", async () => {
    // @ts-expect-error
    spyOn(croner, "Cron").mockImplementation(() => ({
      isRunning: jest.fn().mockReturnValue(false),
      stop: jest.fn(),
    }));
    const loggerInfoSpy = spyOn(logger, "info").mockImplementation(jest.fn());
    const loggerErrorSpy = spyOn(logger, "error").mockImplementation(jest.fn());

    const jobHandler = new JobHandler(logger);

    const job = jobHandler.handle({
      cron: "* * * * *",
      label: "Test Job",
      process: jest.fn().mockRejectedValue(new Error("Job failed")),
    });
    await job();

    expect(loggerInfoSpy).toHaveBeenCalledWith(expect.objectContaining({ message: "Test Job start" }));
    expect(loggerErrorSpy).toHaveBeenCalledWith(expect.objectContaining({ message: "Test Job error" }));
  });

  test("should handle job overrun", async () => {
    const loggerInfoSpy = spyOn(logger, "info").mockImplementation(jest.fn());

    const jobHandler = new JobHandler(logger);
    const protectJob = jobHandler.protect({} as croner.Cron);

    // Run the protect function
    await protectJob();

    // Verify that the overrun log was triggered
    expect(loggerInfoSpy).toHaveBeenCalledWith(expect.objectContaining({ message: "undefined overrun" }));
  });

  test("DAY_TIME schedule", () => {
    expect(Jobs.SCHEDULES.DAY_TIME(UTC_DAY_OF_THE_WEEK.Monday, new tools.Hour(18))).toEqual(
      `0 18 * * ${UTC_DAY_OF_THE_WEEK.Monday}`,
    );
  });
});
