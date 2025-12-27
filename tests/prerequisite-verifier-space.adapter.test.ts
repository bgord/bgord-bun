import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { DiskSpaceCheckerNoopAdapter } from "../src/disk-space-checker-noop.adapter";
import { PrerequisiteVerifierSpaceAdapter } from "../src/prerequisite-verifier-space.adapter";
import * as mocks from "./mocks";

const minimum = tools.Size.fromMB(50);
const failure = tools.Size.fromMB(10);

const DiskSpaceCheckerSuccess = new DiskSpaceCheckerNoopAdapter(tools.Size.fromMB(100));
const DiskSpaceCheckerFailure = new DiskSpaceCheckerNoopAdapter(failure);
const deps = { DiskSpaceChecker: DiskSpaceCheckerSuccess };
const depsFailure = { DiskSpaceChecker: DiskSpaceCheckerFailure };

describe("PrerequisiteVerifierSpaceAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierSpaceAdapter({ minimum }, deps);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - not enough space", async () => {
    const prerequisite = new PrerequisiteVerifierSpaceAdapter({ minimum }, depsFailure);

    const result = await prerequisite.verify();

    expect(result).toEqual(
      mocks.VerificationFailure({ message: `Free disk space: ${failure.format(tools.Size.unit.MB)}` }),
    );
  });

  test("failure - error", async () => {
    spyOn(DiskSpaceCheckerFailure, "get").mockRejectedValue(new Error(mocks.IntentionalError));
    const prerequisite = new PrerequisiteVerifierSpaceAdapter({ minimum }, depsFailure);

    // @ts-expect-error
    const result = (await prerequisite.verify()).error.message;

    expect(result).toMatch(mocks.IntentionalError);
  });
});
