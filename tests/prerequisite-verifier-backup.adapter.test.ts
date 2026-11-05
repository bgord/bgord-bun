import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";
import { PrerequisiteVerification, PrerequisiteVerificationOutcome } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierBackupAdapter } from "../src/prerequisite-verifier-backup.adapter";
import * as mocks from "./mocks";

const file = tools.FilePathAbsolute.fromString("/var/backups/app/last-success.stamp");
const maximum = tools.Duration.Hours(26);

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const FileInspection = new FileInspectionNoopAdapter({ exists: true, lastModified: mocks.TIME_ZERO });
const deps = { Clock, FileInspection };

const prerequisite = new PrerequisiteVerifierBackupAdapter({ file, maximum }, deps);

describe("PrerequisiteVerifierBackupAdapter", () => {
  test("success", async () => {
    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("success - age equals the maximum", async () => {
    using _ = spyOn(FileInspection, "lastModified").mockResolvedValue(mocks.TIME_ZERO.subtract(maximum));

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - age", async () => {
    using _ = spyOn(FileInspection, "lastModified").mockResolvedValue(
      mocks.TIME_ZERO.subtract(tools.Duration.Hours(27)),
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("Age: 97200s"));
  });

  test("failure - file inspection", async () => {
    using _ = spyOn(FileInspection, "lastModified").mockImplementation(mocks.throwIntentionalErrorAsync);

    const result = await prerequisite.verify();

    expect(result.outcome).toEqual(PrerequisiteVerificationOutcome.failure);
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("backup");
  });
});
