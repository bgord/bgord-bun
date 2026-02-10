import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { DiskSpaceCheckerNoopAdapter } from "../src/disk-space-checker-noop.adapter";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
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

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - not enough space", async () => {
    const prerequisite = new PrerequisiteVerifierSpaceAdapter({ minimum }, depsFailure);

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure(`Free disk space: ${failure.format(tools.Size.unit.MB)}`),
    );
  });

  test("failure - error", async () => {
    const prerequisite = new PrerequisiteVerifierSpaceAdapter({ minimum }, depsFailure);
    using _ = spyOn(DiskSpaceCheckerFailure, "get").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(await prerequisite.verify()).toMatchObject(
      PrerequisiteVerification.failure(mocks.IntentionalError),
    );
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierSpaceAdapter({ minimum }, deps);

    expect(prerequisite.kind).toEqual("space");
  });
});
