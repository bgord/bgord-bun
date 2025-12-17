import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteJobs } from "../src/prerequisites/jobs";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteJobs", () => {
  test("success", async () => {
    const Jobs = { a: { isRunning: () => true } as any };
    const prerequisite = new PrerequisiteJobs({ label: "jobs", Jobs });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("failure - one job not running", async () => {
    const Jobs = { a: { isRunning: () => false } as any, b: { isRunning: () => true } as any };
    const prerequisite = new PrerequisiteJobs({ label: "jobs", Jobs });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationFailure());
  });

  test("undetermined", async () => {
    const Jobs = { a: { isRunning: () => true } as any };
    const prerequisite = new PrerequisiteJobs({ label: "jobs", enabled: false, Jobs });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationUndetermined);
  });
});
