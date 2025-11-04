import { describe, expect, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteDirectory } from "../src/prerequisites/directory";
import * as prereqs from "../src/prerequisites.service";
import * as mocks from "./mocks";

const directory = tools.DirectoryPathAbsoluteSchema.parse("/mocked/path");
const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteDirectory", () => {
  test("success - directory is accessible with required flags", async () => {
    spyOn(fsp, "access").mockResolvedValue();

    expect(await new PrerequisiteDirectory({ label: "dir", directory }).verify(clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure - access throws an error", async () => {
    spyOn(fsp, "access").mockRejectedValue(new Error(mocks.IntentialError));

    // @ts-expect-error
    expect(
      (await new PrerequisiteDirectory({ label: "dir", directory }).verify(clock)).error.message,
    ).toMatch(mocks.IntentialError);
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteDirectory({ label: "dir", directory: directory, enabled: false }).verify(clock),
    ).toEqual(prereqs.Verification.undetermined());
  });
});
