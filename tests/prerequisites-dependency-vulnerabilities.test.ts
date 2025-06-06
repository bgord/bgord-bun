import { describe, expect, spyOn, test } from "bun:test";
import bun from "bun";

import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteDependencyVulnerabilities } from "../src/prerequisites/dependency-vulnerabilities";
import * as mocks from "./mocks";

describe("prerequisites - dependency vulnerabilities", () => {
  test("passes if bun audit returns no high and critical vulnerabilities", async () => {
    // @ts-expect-error
    const bunShellStdout = spyOn(bun, "$").mockResolvedValue({
      exitCode: 0,
      stdout: Buffer.from(JSON.stringify(mocks.BUN_AUDIT_OUTPUT_WITH_LOW_AND_MODERATE)),
    });

    const dependencyVulnerabilities = new PrerequisiteDependencyVulnerabilities({
      label: "dependency-vulnerabilities",
    });

    const result = await dependencyVulnerabilities.verify();
    expect(result).toBe(PrerequisiteStatusEnum.success);

    bunShellStdout.mockRestore();
  });

  test("rejects if bun audit returns high and critical vulnerabilities", async () => {
    // @ts-expect-error
    const bunShellStdout = spyOn(bun, "$").mockResolvedValue({
      exitCode: 0,
      stdout: Buffer.from(JSON.stringify(mocks.BUN_AUDIT_OUTPUT_WITH_VULNERABILITIES)),
    });

    const dependencyVulnerabilities = new PrerequisiteDependencyVulnerabilities({
      label: "dependency-vulnerabilities",
    });

    const result = await dependencyVulnerabilities.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);

    bunShellStdout.mockRestore();
  });

  test("rejects if bun audit exits with 1", async () => {
    // @ts-expect-error
    const bunShellStdout = spyOn(bun, "$").mockResolvedValue({
      exitCode: 1,
    });

    const dependencyVulnerabilities = new PrerequisiteDependencyVulnerabilities({
      label: "dependency-vulnerabilities",
    });

    const result = await dependencyVulnerabilities.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);

    bunShellStdout.mockRestore();
  });

  test("rejects if bun audit parsing fails", async () => {
    // @ts-expect-error
    const bunShellStdout = spyOn(bun, "$").mockResolvedValue({
      exitCode: 0,
      stdout: Buffer.from("abc"),
    });

    const dependencyVulnerabilities = new PrerequisiteDependencyVulnerabilities({
      label: "dependency-vulnerabilities",
    });

    const result = await dependencyVulnerabilities.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);

    bunShellStdout.mockRestore();
  });

  test("returns undetermined if disabled", async () => {
    const node = new PrerequisiteDependencyVulnerabilities({
      label: "dependency-vulnerabilities",
      enabled: false,
    });

    const result = await node.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
