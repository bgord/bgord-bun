import { describe, expect, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";
import * as tools from "@bgord/tools";
import { PrerequisiteDirectory } from "../src/prerequisites/directory";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";

const directory = tools.DirectoryPathAbsoluteSchema.parse("/mocked/path");

describe("prerequisites - directory", () => {
  test("returns success if directory is accessible with required flags", async () => {
    spyOn(fsp, "access").mockResolvedValue();

    const prerequisite = new PrerequisiteDirectory({
      label: "Test directory",
      directory: directory,
      access: { write: true },
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.success);
  });

  test("returns failure if access throws error", async () => {
    spyOn(fsp, "access").mockRejectedValue(new Error("No access"));

    const prerequisite = new PrerequisiteDirectory({
      label: "Test directory",
      directory: directory,
      access: { write: true },
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);
  });

  test("returns undetermined if prerequisite is disabled", async () => {
    const prerequisite = new PrerequisiteDirectory({
      label: "Disabled directory",
      directory: directory,
      enabled: false,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
