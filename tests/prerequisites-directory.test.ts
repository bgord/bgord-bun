import { describe, expect, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";
import * as tools from "@bgord/tools";
import { PrerequisiteDirectory } from "../src/prerequisites/directory";
import * as prereqs from "../src/prerequisites.service";

const directory = tools.DirectoryPathAbsoluteSchema.parse("/mocked/path");

describe("prerequisites - directory", () => {
  test("success - directory is accessible with required flags", async () => {
    spyOn(fsp, "access").mockResolvedValue();

    expect(await new PrerequisiteDirectory({ label: "dir", directory }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure - access throws an error", async () => {
    spyOn(fsp, "access").mockRejectedValue(new Error("No access"));

    // @ts-expect-error
    expect((await new PrerequisiteDirectory({ label: "dir", directory }).verify()).error.message).toMatch(
      /No access/,
    );
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteDirectory({ label: "dir", directory: directory, enabled: false }).verify(),
    ).toEqual(prereqs.Verification.undetermined());
  });
});
