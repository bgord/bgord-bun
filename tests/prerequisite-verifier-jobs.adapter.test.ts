import { describe, expect, test } from "bun:test";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierJobsAdapter } from "../src/prerequisite-verifier-jobs.adapter";

const stop = () => {};

describe("PrerequisiteVerifierJobsAdapter", () => {
  test("success", async () => {
    const Jobs = { a: { isRunning: () => true, stop } };
    const prerequisite = new PrerequisiteVerifierJobsAdapter({ Jobs });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - one job not running", async () => {
    const Jobs = { a: { isRunning: () => false, stop }, b: { isRunning: () => true, stop } };
    const prerequisite = new PrerequisiteVerifierJobsAdapter({ Jobs });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure());
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierJobsAdapter({ Jobs: {} });

    expect(prerequisite.kind).toEqual("jobs");
  });
});
