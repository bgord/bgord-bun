import { describe, expect, spyOn, test } from "bun:test";
import { LoggerWinstonProductionAdapter } from "../src/logger-winston-production.adapter";
import { PrerequisiteLogFile } from "../src/prerequisites/log-file";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";

const logger = new LoggerWinstonProductionAdapter({
  app: "test-app",
  AXIOM_API_TOKEN: "ok",
});

describe("prerequisites - log file", () => {
  test("returns success when log file exists", async () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true });

    const prerequisite = new PrerequisiteLogFile({
      logger,
      label: "log-file",
      enabled: true,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.success);
  });

  test("returns failure when log file does not exist", async () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockReturnValue({ exists: async () => false });

    const prerequisite = new PrerequisiteLogFile({
      logger,
      label: "log-file",
      enabled: true,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);
  });

  test("returns failure on exception", async () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockReturnValue({
      exists: async () => {
        throw new Error("Mock error");
      },
    });

    const prerequisite = new PrerequisiteLogFile({
      logger,
      label: "log-file",
      enabled: true,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);
  });

  test("returns undetermined when disabled", async () => {
    const prerequisite = new PrerequisiteLogFile({
      logger,
      label: "log-file",
      enabled: false,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
