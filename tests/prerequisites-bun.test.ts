import { expect, test } from "bun:test";
import * as tools from "@bgord/tools";

import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteBun } from "../src/prerequisites/bun";

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
