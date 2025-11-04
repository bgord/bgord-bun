import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { DiskSpaceCheckerNoopAdapter } from "../src/disk-space-checker-noop.adapter";
import { PrerequisiteSpace } from "../src/prerequisites/space";
import * as prereqs from "../src/prerequisites.service";
import * as mocks from "./mocks";

const minimum = tools.Size.fromMB(50);

const DiskSpaceCheckerSuccess = new DiskSpaceCheckerNoopAdapter(tools.Size.fromMB(100));

const failure = tools.Size.fromMB(10);
const DiskSpaceCheckerFailure = new DiskSpaceCheckerNoopAdapter(failure);

const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteSpace", () => {
  test("success", async () => {
    expect(
      await new PrerequisiteSpace({ label: "space", minimum, checker: DiskSpaceCheckerSuccess }).verify(
        clock,
      ),
    ).toEqual(mocks.VerificationSuccess);
  });

  test("failure - not enough space", async () => {
    const result = await new PrerequisiteSpace({
      label: "space",
      minimum,
      checker: DiskSpaceCheckerFailure,
    }).verify(clock);

    // @ts-expect-error
    expect(result.error.message).toMatch(`Free disk space: ${failure.format(tools.Size.unit.MB)}`);
  });

  test("failure - error", async () => {
    spyOn(DiskSpaceCheckerFailure, "get").mockRejectedValue(new Error(mocks.IntentialError));

    const result = await new PrerequisiteSpace({
      label: "space",
      minimum,
      checker: DiskSpaceCheckerFailure,
    }).verify(clock);

    // @ts-expect-error
    expect(result.error.message).toMatch(mocks.IntentialError);
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteSpace({
        label: "space",
        minimum,
        enabled: false,
        checker: DiskSpaceCheckerSuccess,
      }).verify(clock),
    ).toEqual(mocks.VerificationUndetermined);
  });
});
