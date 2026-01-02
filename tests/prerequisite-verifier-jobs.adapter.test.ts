import { describe, expect, test } from "bun:test";
import { PrerequisiteVerifierJobsAdapter } from "../src/prerequisite-verifier-jobs.adapter";
import * as mocks from "./mocks";

describe("PrerequisiteVerifierJobsAdapter", () => {
  test("success", async () => {
    const Jobs = { a: { isRunning: () => true } as any };
    const prerequisite = new PrerequisiteVerifierJobsAdapter({ Jobs });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - one job not running", async () => {
    const Jobs = { a: { isRunning: () => false } as any, b: { isRunning: () => true } as any };
    const prerequisite = new PrerequisiteVerifierJobsAdapter({ Jobs });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure());
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierJobsAdapter({ Jobs: {} });

    expect(prerequisite.kind).toEqual("jobs");
  });
});
