import { describe, expect, test } from "bun:test";
import { PrerequisiteJobs } from "../src/prerequisites/jobs";
import * as mocks from "./mocks";

describe("PrerequisiteJobs", () => {
  test("success", async () => {
    const Jobs = { a: { isRunning: () => true } as any };
    const prerequisite = new PrerequisiteJobs({ label: "jobs", Jobs });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - one job not running", async () => {
    const Jobs = { a: { isRunning: () => false } as any, b: { isRunning: () => true } as any };
    const prerequisite = new PrerequisiteJobs({ label: "jobs", Jobs });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure());
  });

  test("undetermined", async () => {
    const Jobs = { a: { isRunning: () => true } as any };
    const prerequisite = new PrerequisiteJobs({ label: "jobs", enabled: false, Jobs });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationUndetermined);
  });
});
