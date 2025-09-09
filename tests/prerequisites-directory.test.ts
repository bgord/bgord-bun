import { describe, expect, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";
import * as tools from "@bgord/tools";
import { PrerequisiteDirectory } from "../src/prerequisites/directory";
import * as prereqs from "../src/prerequisites.service";

const directory = tools.DirectoryPathAbsoluteSchema.parse("/mocked/path");

describe("prerequisites - directory", () => {
  test("returns success if directory is accessible with required flags", async () => {
    spyOn(fsp, "access").mockResolvedValue();

    const prerequisite = new PrerequisiteDirectory({ label: "dir", directory });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("returns failure if access throws error", async () => {
    spyOn(fsp, "access").mockRejectedValue(new Error("No access"));

    const prerequisite = new PrerequisiteDirectory({ label: "dir", directory });
    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(/No access/);
  });

  test("returns undetermined if prerequisite is disabled", async () => {
    const prerequisite = new PrerequisiteDirectory({ label: "dir", directory: directory, enabled: false });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
