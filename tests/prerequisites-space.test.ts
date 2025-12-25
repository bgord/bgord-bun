import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { DiskSpaceCheckerNoopAdapter } from "../src/disk-space-checker-noop.adapter";
import { PrerequisiteSpace } from "../src/prerequisites/space";
import * as mocks from "./mocks";

const minimum = tools.Size.fromMB(50);
const failure = tools.Size.fromMB(10);

const DiskSpaceCheckerSuccess = new DiskSpaceCheckerNoopAdapter(tools.Size.fromMB(100));
const DiskSpaceCheckerFailure = new DiskSpaceCheckerNoopAdapter(failure);
const deps = { DiskSpaceChecker: DiskSpaceCheckerSuccess };
const depsFailure = { DiskSpaceChecker: DiskSpaceCheckerFailure };

describe("PrerequisiteSpace", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteSpace({ label: "space", minimum }, deps);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - not enough space", async () => {
    const prerequisite = new PrerequisiteSpace({ label: "space", minimum }, depsFailure);

    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(
      `Free disk space: ${failure.format(tools.Size.unit.MB)}`,
    );
  });

  test("failure - error", async () => {
    spyOn(DiskSpaceCheckerFailure, "get").mockRejectedValue(new Error(mocks.IntentionalError));
    const prerequisite = new PrerequisiteSpace({ label: "space", minimum }, depsFailure);

    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(mocks.IntentionalError);
  });
});
