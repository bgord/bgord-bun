import { describe, expect, test } from "bun:test";
import { PrerequisiteJobs } from "../src/prerequisites/jobs";
import * as prereqs from "../src/prerequisites.service";

describe("PrerequisiteJobs", () => {
  test("success - all jobs running", async () => {
    const jobs = { a: { isRunning: () => true } as any };

    expect(await new PrerequisiteJobs({ label: "jobs", jobs }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure - one job not running", async () => {
    const jobs = { a: { isRunning: () => false } as any, b: { isRunning: () => true } as any };

    expect(await new PrerequisiteJobs({ label: "jobs", jobs }).verify()).toEqual(
      prereqs.Verification.failure(),
    );
  });

  test("undetermined", async () => {
    const jobs = { a: { isRunning: () => true } as any };

    expect(await new PrerequisiteJobs({ label: "jobs", enabled: false, jobs }).verify()).toEqual(
      prereqs.Verification.undetermined(),
    );
  });
});
