import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { BUILD_INFO_REPOSITORY_FILE_PATH } from "../src/build-info-repository-file.strategy";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierFileAdapter } from "../src/prerequisite-verifier-file.adapter";
import * as mocks from "./mocks";

const path = tools.FilePathAbsolute.fromString("/tmp/test-file.txt");

describe("PrerequisiteVerifierFileAdapter", () => {
  test("success - all", async () => {
    const FileInspection = new FileInspectionNoopAdapter({
      exists: true,
      permissions: { read: true, write: true, execute: true },
    });
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: path, permissions: { read: true, write: true, execute: true } },
      { FileInspection },
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("success - read", async () => {
    const FileInspection = new FileInspectionNoopAdapter({
      exists: true,
      permissions: { read: true, write: false, execute: false },
    });
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: path, permissions: { read: true } },
      { FileInspection },
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("success - write", async () => {
    const FileInspection = new FileInspectionNoopAdapter({
      exists: true,
      permissions: { read: false, write: true, execute: false },
    });
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: path, permissions: { write: true } },
      { FileInspection },
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("success - execute", async () => {
    const FileInspection = new FileInspectionNoopAdapter({
      exists: true,
      permissions: { read: false, write: false, execute: true },
    });
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: path, permissions: { execute: true } },
      { FileInspection },
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - file does not exist", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: false });
    const prerequisite = new PrerequisiteVerifierFileAdapter({ file: path }, { FileInspection });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("File does not exist"));
  });

  test("failure - file does not exist error", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: false });
    using _ = spyOn(FileInspection, "exists").mockImplementation(mocks.throwIntentionalErrorAsync);
    const prerequisite = new PrerequisiteVerifierFileAdapter({ file: path }, { FileInspection });

    expect(await prerequisite.verify()).toMatchObject(
      PrerequisiteVerification.failure(mocks.IntentionalError),
    );
  });

  test("failure - read", async () => {
    const FileInspection = new FileInspectionNoopAdapter({
      exists: true,
      permissions: { read: false, write: false, execute: false },
    });
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: path, permissions: { read: true } },
      { FileInspection },
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("File is not readable"));
  });

  test("failure - write", async () => {
    const FileInspection = new FileInspectionNoopAdapter({
      exists: true,
      permissions: { read: true, write: false, execute: false },
    });
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: path, permissions: { read: true, write: true } },
      { FileInspection },
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("File is not writable"));
  });

  test("failure - execute", async () => {
    const FileInspection = new FileInspectionNoopAdapter({
      exists: true,
      permissions: { read: true, write: true, execute: false },
    });
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: path, permissions: { read: true, write: true, execute: true } },
      { FileInspection },
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("File is not executable"));
  });

  test("integration - BUILD_INFO_REPOSITORY_FILE_PATH", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: true });
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: BUILD_INFO_REPOSITORY_FILE_PATH },
      { FileInspection },
    );
    using fileInspectionExists = spyOn(FileInspection, "exists");

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
    expect(fileInspectionExists).toHaveBeenCalledWith(BUILD_INFO_REPOSITORY_FILE_PATH);
  });

  test("kind", () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: true });
    const prerequisite = new PrerequisiteVerifierFileAdapter({ file: path }, { FileInspection });

    expect(prerequisite.kind).toEqual("file");
  });
});
