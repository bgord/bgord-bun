import { describe, expect, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteDirectory } from "../src/prerequisites/directory";
import * as mocks from "./mocks";

const directory = tools.DirectoryPathAbsoluteSchema.parse("/mocked/path");

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteDirectory", () => {
  test("success - directory is accessible with required flags", async () => {
    spyOn(fsp, "access").mockResolvedValue();

    expect(await new PrerequisiteDirectory({ label: "dir", directory }).verify(Clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure - access throws an error", async () => {
    spyOn(fsp, "access").mockRejectedValue(new Error(mocks.IntentialError));

    expect(
      // @ts-expect-error
      (await new PrerequisiteDirectory({ label: "dir", directory }).verify(Clock)).error.message,
    ).toMatch(mocks.IntentialError);
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteDirectory({ label: "dir", directory: directory, enabled: false }).verify(Clock),
    ).toEqual(mocks.VerificationUndetermined);
  });
});
