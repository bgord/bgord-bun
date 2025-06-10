import { describe, expect, jest, spyOn, test } from "bun:test";
import * as croner from "croner";

import { JobHandler } from "../src/jobs.service";
import { Logger } from "../src/logger.service";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

const logger = new Logger({
  app: "test",
  environment: NodeEnvironmentEnum.local,
});

describe("JobHandler", () => {
  test("should log job start and success when job is processed successfully", async () => {
    // @ts-expect-error
    const cronerSpy = spyOn(croner, "Cron").mockImplementation(() => ({
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

    loggerInfoSpy.mockRestore();
    cronerSpy.mockRestore();
  });

  test("should log job error when job fails", async () => {
    // @ts-expect-error
    const cronerSpy = spyOn(croner, "Cron").mockImplementation(() => ({
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

    loggerInfoSpy.mockRestore();
    loggerErrorSpy.mockRestore();
    cronerSpy.mockRestore();
  });

  test("should handle job overrun", async () => {
    const loggerInfoSpy = spyOn(logger, "info").mockImplementation(jest.fn());

    const jobHandler = new JobHandler(logger);
    const protectJob = jobHandler.protect({} as croner.Cron);

    // Run the protect function
    await protectJob();

    // Verify that the overrun log was triggered
    expect(loggerInfoSpy).toHaveBeenCalledWith(expect.objectContaining({ message: "undefined overrun" }));

    loggerInfoSpy.mockRestore();
  });
});
