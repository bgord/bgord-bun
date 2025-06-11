import { describe, expect, spyOn, test } from "bun:test";
import bun from "bun";

import { PrerequisiteStatusEnum } from "../src/prerequisites.service";
import { PrerequisiteBinary } from "../src/prerequisites/binary";

describe("prerequisites - binary", () => {
  test("returns success if binary is found", async () => {
    const bunShell = spyOn(bun, "$").mockImplementation(() => ({
      // @ts-expect-error
      quiet: () => ({ exitCode: 0 }),
    }));

    const prerequisite = new PrerequisiteBinary({
      label: "RealBinary",
      binary: "real-binary",
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.success);

    bunShell.mockRestore();
  });

  test("returns failure if binary is not found", async () => {
    const bunShell = spyOn(bun, "$").mockImplementation(() => ({
      // @ts-expect-error
      quiet: () => ({ exitCode: 1 }),
    }));

    const prerequisite = new PrerequisiteBinary({
      label: "FakeBinary",
      binary: "fake-binary",
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.failure);

    bunShell.mockRestore();
  });

  test("returns failure if binary name is invalid", async () => {
    const prerequisite = new PrerequisiteBinary({
      label: "InvalidBinary",
      binary: "invalid binary",
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.failure);
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteBinary({
      label: "binary",
      binary: "node",
      enabled: false,
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
