import { describe, expect, test } from "bun:test";
import { PrerequisiteJobs } from "../src/prerequisites/jobs";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";

describe("prerequisites - jobs", () => {
  test("verify method returns success for all jobs running", async () => {
    const result = await new PrerequisiteJobs({
      label: "jobs",
      jobs: { a: { isRunning: () => true } as any },
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);
  });

  test("verify method returns failure for at least one job not running", async () => {
    const result = await new PrerequisiteJobs({
      label: "jobs",
      jobs: {
        a: { isRunning: () => false } as any,
        b: { isRunning: () => true } as any,
      },
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteJobs({
      label: "jobs",
      enabled: false,
      jobs: { a: { isRunning: () => true } as any },
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
