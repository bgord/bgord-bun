import { describe, expect, it, spyOn } from "bun:test";

import { Logger } from "../src/logger";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteLogFile } from "../src/prerequisites/log-file";

describe("PrerequisiteLogFile", () => {
  const logger = new Logger({
    app: "test-app",
    environment: NodeEnvironmentEnum.production,
  });

  it("returns success when log file exists", async () => {
    // @ts-expect-error
    const existsSpy = spyOn(Bun, "file").mockReturnValue({
      exists: async () => true,
    });

    const prerequisite = new PrerequisiteLogFile({
      logger,
      label: "log-file",
      enabled: true,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.success);

    existsSpy.mockRestore();
  });

  it("returns failure when log file does not exist", async () => {
    // @ts-expect-error
    const existsSpy = spyOn(Bun, "file").mockReturnValue({
      exists: async () => false,
    });

    const prerequisite = new PrerequisiteLogFile({
      logger,
      label: "log-file",
      enabled: true,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);

    existsSpy.mockRestore();
  });

  it("returns undetermined when disabled", async () => {
    const prerequisite = new PrerequisiteLogFile({
      logger,
      label: "log-file",
      enabled: false,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });

  it("returns failure on exception", async () => {
    // @ts-expect-error
    const existsSpy = spyOn(Bun, "file").mockReturnValue({
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

    existsSpy.mockRestore();
  });
});
