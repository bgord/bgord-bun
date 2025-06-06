import { describe, expect, spyOn, test } from "bun:test";

import { Logger } from "../src/logger";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteLogFile } from "../src/prerequisites/log-file";

describe("prerequisites - log file", () => {
  const logger = new Logger({
    app: "test-app",
    environment: NodeEnvironmentEnum.production,
  });

  test("returns success when log file exists", async () => {
    // @ts-expect-error
    const bunFileExists = spyOn(Bun, "file").mockReturnValue({
      exists: async () => true,
    });

    const prerequisite = new PrerequisiteLogFile({
      logger,
      label: "log-file",
      enabled: true,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.success);

    bunFileExists.mockRestore();
  });

  test("returns failure when log file does not exist", async () => {
    // @ts-expect-error
    const bunFileExists = spyOn(Bun, "file").mockReturnValue({
      exists: async () => false,
    });

    const prerequisite = new PrerequisiteLogFile({
      logger,
      label: "log-file",
      enabled: true,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);

    bunFileExists.mockRestore();
  });

  test("returns failure on exception", async () => {
    // @ts-expect-error
    const bunFileExists = spyOn(Bun, "file").mockReturnValue({
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

    bunFileExists.mockRestore();
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
