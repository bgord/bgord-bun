import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { DiskSpaceCheckerNoopAdapter } from "../src/disk-space-checker-noop.adapter";
import { PrerequisiteSpace } from "../src/prerequisites/space";
import * as mocks from "./mocks";

const minimum = tools.Size.fromMB(50);
const failure = tools.Size.fromMB(10);

const DiskSpaceCheckerSuccess = new DiskSpaceCheckerNoopAdapter(tools.Size.fromMB(100));
const DiskSpaceCheckerFailure = new DiskSpaceCheckerNoopAdapter(failure);
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { DiskSpaceChecker: DiskSpaceCheckerSuccess };
const depsFailure = { DiskSpaceChecker: DiskSpaceCheckerFailure };

describe("PrerequisiteSpace", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteSpace({ label: "space", minimum }, deps);

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("failure - not enough space", async () => {
    const prerequisite = new PrerequisiteSpace({ label: "space", minimum }, depsFailure);

    // @ts-expect-error
    expect((await prerequisite.verify(Clock)).error.message).toMatch(
      `Free disk space: ${failure.format(tools.Size.unit.MB)}`,
    );
  });

  test("failure - error", async () => {
    spyOn(DiskSpaceCheckerFailure, "get").mockRejectedValue(new Error(mocks.IntentialError));
    const prerequisite = new PrerequisiteSpace({ label: "space", minimum }, depsFailure);

    // @ts-expect-error
    expect((await prerequisite.verify(Clock)).error.message).toMatch(mocks.IntentialError);
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteSpace({ label: "space", minimum, enabled: false }, deps);

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationUndetermined);
  });
});
