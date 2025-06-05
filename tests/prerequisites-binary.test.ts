import { afterEach, describe, expect, jest, spyOn, test } from "bun:test";
import bun from "bun";
import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteBinary } from "../src/prerequisites/binary";

describe("prerequisites - binary", () => {
  afterEach(() => jest.restoreAllMocks());

  test("returns success if binary is found", async () => {
    // @ts-expect-error
    const spy = spyOn(bun, "$").mockResolvedValue({ exitCode: 0 });

    const prerequisite = new PrerequisiteBinary({
      label: "Node.js",
      binary: "node",
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.success);

    spy.mockRestore();
  });

  test("returns failure if binary is not found", async () => {
    // @ts-expect-error
    const spy = spyOn(bun, "$").mockResolvedValue({ exitCode: 1 });

    const prerequisite = new PrerequisiteBinary({
      label: "FakeBinary",
      binary: "fake-binary",
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.failure);

    spy.mockRestore();
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
});
