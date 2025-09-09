import { describe, expect, spyOn, test } from "bun:test";
import bun from "bun";
import { PrerequisiteDependencyVulnerabilities } from "../src/prerequisites/dependency-vulnerabilities";
import * as prereqs from "../src/prerequisites.service";

const BUN_AUDIT_OUTPUT_WITH_LOW_AND_MODERATE = {
  "@mozilla/readability": [
    {
      id: 1103525,
      url: "https://github.com/advisories/GHSA-3p6v-hrg8-8qj7",
      title: "@mozilla/readability Denial of Service through Regex",
      severity: "low",
      vulnerable_versions: "<0.6.0",
      cwe: ["CWE-1333"],
      cvss: { score: 0, vectorString: null },
    },
  ],
  "@babel/runtime": [
    {
      id: 1104000,
      url: "https://github.com/advisories/GHSA-968p-4wvh-cqc8",
      title:
        "Babel has inefficient RegExp complexity in generated code with .replace when transpiling named capturing groups",
      severity: "moderate",
      vulnerable_versions: "<7.26.10",
      cwe: ["CWE-1333"],
      cvss: {
        score: 6.2,
        vectorString: "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
      },
    },
  ],
};

const BUN_AUDIT_OUTPUT_WITH_VULNERABILITIES = {
  ...BUN_AUDIT_OUTPUT_WITH_LOW_AND_MODERATE,
  "connect-multiparty": [
    {
      id: 1104679,
      url: "https://github.com/advisories/GHSA-w2xw-44r3-4v9g",
      title: "Connect-Multiparty allows arbitrary file upload",
      severity: "high",
      vulnerable_versions: "<=2.2.0",
      cwe: ["CWE-434"],
      cvss: {
        score: 7.8,
        vectorString: "CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H",
      },
    },
  ],
  vitest: [
    {
      id: 1102429,
      url: "https://github.com/advisories/GHSA-9crc-q9x8-hgqq",
      title:
        "Vitest allows Remote Code Execution when accessing a malicious website while Vitest API server is listening",
      severity: "critical",
      vulnerable_versions: ">=2.0.0 <2.1.9",
      cwe: ["CWE-1385"],
      cvss: {
        score: 9.7,
        vectorString: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:H/A:H",
      },
    },
  ],
};

describe("prerequisites - dependency vulnerabilities", () => {
  test("passes if bun audit returns no high and critical vulnerabilities", async () => {
    spyOn(bun, "$").mockImplementation(() => ({
      // @ts-expect-error
      quiet: () => ({
        exitCode: 0,
        stdout: Buffer.from(JSON.stringify(BUN_AUDIT_OUTPUT_WITH_LOW_AND_MODERATE)),
      }),
    }));

    const dependencyVulnerabilities = new PrerequisiteDependencyVulnerabilities({ label: "deps" });
    const result = await dependencyVulnerabilities.verify();
    expect(result).toEqual(prereqs.Verification.success());
  });

  test("rejects if bun audit returns high and critical vulnerabilities", async () => {
    spyOn(bun, "$").mockImplementation(() => ({
      // @ts-expect-error
      quiet: () => ({
        exitCode: 0,
        stdout: Buffer.from(JSON.stringify(BUN_AUDIT_OUTPUT_WITH_VULNERABILITIES)),
      }),
    }));

    const dependencyVulnerabilities = new PrerequisiteDependencyVulnerabilities({ label: "deps" });
    const result = await dependencyVulnerabilities.verify();
    expect(result).toEqual(prereqs.Verification.failure({ message: "Critical: 1 and high: 1" }));
  });

  test("rejects if bun audit exits with 1", async () => {
    // @ts-expect-error
    spyOn(bun, "$").mockImplementation(() => ({ quiet: () => ({ exitCode: 1 }) }));
    const dependencyVulnerabilities = new PrerequisiteDependencyVulnerabilities({ label: "deps" });
    const result = await dependencyVulnerabilities.verify();
    expect(result).toEqual(prereqs.Verification.failure({ message: "Audit failure" }));
  });

  test("rejects if bun audit parsing fails", async () => {
    spyOn(bun, "$").mockImplementation(() => ({
      // @ts-expect-error
      quiet: () => ({ exitCode: 0, stdout: Buffer.from("abc") }),
    }));

    const dependencyVulnerabilities = new PrerequisiteDependencyVulnerabilities({ label: "deps" });
    const result = await dependencyVulnerabilities.verify();
    // @ts-expect-error
    expect(result.error.message).toMatch(/Unexpected identifier "abc"/);
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteDependencyVulnerabilities({ label: "deps", enabled: false });
    const result = await prerequisite.verify();
    expect(result).toEqual(prereqs.Verification.undetermined());
  });
});
