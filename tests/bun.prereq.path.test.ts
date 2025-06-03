import { expect, jest, mock, test } from "bun:test";
import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisitePath } from "../src/prerequisites/path";

const DUMMY_PATH = "/mocked/path";

test("returns success if path is accessible with required flags", async () => {
  mock.module("node:fs/promises", () => ({
    default: {
      access: async () => {},
    },
  }));

  const prerequisite = new PrerequisitePath({
    label: "Test Path",
    path: DUMMY_PATH,
    access: { write: true },
  });

  const result = await prerequisite.verify();
  expect(result).toBe(PrerequisiteStatusEnum.success);

  jest.restoreAllMocks();
});

test("returns failure if access throws error", async () => {
  mock.module("node:fs/promises", () => ({
    default: {
      access: async () => {
        throw new Error("No access");
      },
    },
  }));

  const prerequisite = new PrerequisitePath({
    label: "Test Path",
    path: DUMMY_PATH,
    access: { write: true },
  });

  const result = await prerequisite.verify();
  expect(result).toBe(PrerequisiteStatusEnum.failure);

  jest.restoreAllMocks();
});

test("returns undetermined if prerequisite is disabled", async () => {
  const prerequisite = new PrerequisitePath({
    label: "Disabled Path",
    path: DUMMY_PATH,
    enabled: false,
  });

  const result = await prerequisite.verify();
  expect(result).toBe(PrerequisiteStatusEnum.undetermined);
});
