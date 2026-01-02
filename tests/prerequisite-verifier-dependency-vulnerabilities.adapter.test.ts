import { describe, expect, spyOn, test } from "bun:test";
import bun from "bun";
import { PrerequisiteVerifierDependencyVulnerabilitiesAdapter } from "../src/prerequisite-verifier-dependency-vulnerabilities.adapter";
import * as mocks from "./mocks";

const prerequisite = new PrerequisiteVerifierDependencyVulnerabilitiesAdapter();

describe("PrerequisiteVerifierDependencyVulnerabilitiesAdapter", () => {
  test("success", async () => {
    const dollarSpy = spyOn(bun, "$").mockImplementation(() => ({
      // @ts-expect-error
      quiet: () => ({
        exitCode: 0,
        stdout: Buffer.from(
          JSON.stringify({ react: [{ severity: "low" }], babel: [{ severity: "moderate" }] }),
        ),
      }),
    }));

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(dollarSpy).toHaveBeenCalledWith(["bun audit --json"]);
  });

  test("failure - one high", async () => {
    spyOn(bun, "$").mockImplementation(() => ({
      // @ts-expect-error
      quiet: () => ({
        exitCode: 0,
        stdout: Buffer.from(JSON.stringify({ mixed: [{ severity: "low" }, { severity: "high" }] })),
      }),
    }));

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: "Critical: 0 and high: 1" }),
    );
  });

  test("failure - critical", async () => {
    spyOn(bun, "$").mockImplementation(() => ({
      // @ts-expect-error
      quiet: () => ({
        exitCode: 0,
        stdout: Buffer.from(JSON.stringify({ pkg: [{ severity: "critical" }] })),
      }),
    }));

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: "Critical: 1 and high: 0" }),
    );
  });

  test("failure - non-zero exit code", async () => {
    // @ts-expect-error
    spyOn(bun, "$").mockImplementation(() => ({ quiet: () => ({ exitCode: 1 }) }));

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure({ message: "Audit failure" }));
  });

  test("failure - invalid audit JSON", async () => {
    spyOn(bun, "$").mockImplementation(() => ({
      // @ts-expect-error
      quiet: () => ({ exitCode: 0, stdout: Buffer.from("abc") }),
    }));

    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(/Unexpected identifier/);
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("dependency-vulnerabilities");
  });
});
