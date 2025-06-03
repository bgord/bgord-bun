import { expect, mock, test } from "bun:test";
import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteBinary } from "../src/prerequisites/binary";

// Mock `bun` module for the `$` function
mock.module("bun", () => ({
  $: async (...args: any[]) => {
    return {
      exitCode: args[0]?.raw?.includes("node") ? 0 : 1,
    };
  },
}));

test("returns success if binary is found", async () => {
  const prerequisite = new PrerequisiteBinary({
    label: "Node.js",
    binary: "node",
  });

  const result = await prerequisite.verify();

  expect(result).toBe(PrerequisiteStatusEnum.success);
  expect(prerequisite.status).toBe(PrerequisiteStatusEnum.success);
});

test("returns failure if binary is not found", async () => {
  const prerequisite = new PrerequisiteBinary({
    label: "FakeBinary",
    binary: "fake-binary",
  });

  const result = await prerequisite.verify();

  expect(result).toBe(PrerequisiteStatusEnum.failure);
  expect(prerequisite.status).toBe(PrerequisiteStatusEnum.failure);
});

test("returns undetermined if disabled", async () => {
  const prerequisite = new PrerequisiteBinary({
    label: "Node.js",
    binary: "node",
    enabled: false,
  });

  const result = await prerequisite.verify();

  expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  expect(prerequisite.status).toBe(PrerequisiteStatusEnum.undetermined);
});

test("returns failure if binary name is invalid", async () => {
  const prerequisite = new PrerequisiteBinary({
    label: "InvalidBinary",
    binary: "invalid binary", // Invalid due to space
  });

  const result = await prerequisite.verify();

  expect(result).toBe(PrerequisiteStatusEnum.failure);
  expect(prerequisite.status).toBe(PrerequisiteStatusEnum.failure);
});
