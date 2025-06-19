import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteBun } from "../src/prerequisites/bun";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";

describe("prerequisites - bun", () => {
  test("returns success if current Bun version is equal to required version", async () => {
    const prerequisite = new PrerequisiteBun({
      label: "Bun Version Check",
      version: tools.PackageVersion.fromString("1.0.0"),
      current: "1.0.0",
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.success);
  });

  test("returns success if current Bun version is greater than required version", async () => {
    const prerequisite = new PrerequisiteBun({
      label: "Bun Version Check",
      version: tools.PackageVersion.fromString("1.0.0"),
      current: "1.1.0",
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.success);
  });

  test("returns failure if current Bun version is less than required version", async () => {
    const prerequisite = new PrerequisiteBun({
      label: "Bun Version Check",
      version: tools.PackageVersion.fromString("1.2.0"),
      current: "1.1.0",
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.failure);
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteBun({
      label: "Bun",
      enabled: false,
      version: tools.PackageVersion.fromString("1.2.0"),
      current: "1.1.0",
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
