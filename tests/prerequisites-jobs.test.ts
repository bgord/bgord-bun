import { describe, expect, test } from "bun:test";
import { PrerequisiteJobs } from "../src/prerequisites/jobs";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - jobs", () => {
  test("verify method returns success for all jobs running", async () => {
    const prerequisite = new PrerequisiteJobs({
      label: "jobs",
      jobs: { a: { isRunning: () => true } as any },
    });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("verify method returns failure for at least one job not running", async () => {
    const prerequisite = new PrerequisiteJobs({
      label: "jobs",
      jobs: { a: { isRunning: () => false } as any, b: { isRunning: () => true } as any },
    });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.failure());
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteJobs({
      label: "jobs",
      enabled: false,
      jobs: { a: { isRunning: () => true } as any },
    });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
