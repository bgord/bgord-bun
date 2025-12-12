import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteJobs } from "../src/prerequisites/jobs";
import * as mocks from "./mocks";

const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteJobs", () => {
  test("success - all jobs running", async () => {
    const Jobs = { a: { isRunning: () => true } as any };

    expect(await new PrerequisiteJobs({ label: "jobs", Jobs }).verify(clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure - one job not running", async () => {
    const Jobs = { a: { isRunning: () => false } as any, b: { isRunning: () => true } as any };

    expect(await new PrerequisiteJobs({ label: "jobs", Jobs }).verify(clock)).toEqual(
      mocks.VerificationFailure(),
    );
  });

  test("undetermined", async () => {
    const Jobs = { a: { isRunning: () => true } as any };

    expect(await new PrerequisiteJobs({ label: "jobs", enabled: false, Jobs }).verify(clock)).toEqual(
      mocks.VerificationUndetermined,
    );
  });
});
