import { describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { BUILD_INFO_REPOSITORY_FILE_PATH } from "../src/build-info-repository-file.strategy";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierFileAdapter } from "../src/prerequisite-verifier-file.adapter";
import * as mocks from "./mocks";

const path = tools.FilePathAbsolute.fromString("/tmp/test-file.txt");

const FileInspection = new FileInspectionNoopAdapter({ exists: true });
const deps = { FileInspection };

describe("PrerequisiteVerifierFileAdapter", () => {
  test("success - all", async () => {
    spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: path, permissions: { read: true, write: true, execute: true } },
      deps,
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("success - read", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: path, permissions: { read: true } },
      deps,
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
    expect(fsAccess).toHaveBeenCalledTimes(1);
    expect(fsAccess).toHaveBeenCalledWith(path.get(), fs.constants.R_OK);
  });

  test("success - write", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: path, permissions: { write: true } },
      deps,
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
    expect(fsAccess).toHaveBeenCalledTimes(1);
    expect(fsAccess).toHaveBeenCalledWith(path.get(), fs.constants.W_OK);
  });

  test("success - execute", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: path, permissions: { execute: true } },
      deps,
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
    expect(fsAccess).toHaveBeenCalledTimes(1);
    expect(fsAccess).toHaveBeenCalledWith(path.get(), fs.constants.X_OK);
  });

  test("failure - file does not exist", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: false });
    const prerequisite = new PrerequisiteVerifierFileAdapter({ file: path }, { FileInspection });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("File does not exist"));
  });

  test("failure - file does not exist error", async () => {
    spyOn(FileInspection, "exists").mockImplementation(mocks.throwIntentionalErrorAsync);
    const prerequisite = new PrerequisiteVerifierFileAdapter({ file: path }, deps);

    expect(await prerequisite.verify()).toMatchObject(
      PrerequisiteVerification.failure(mocks.IntentionalError),
    );
  });

  test("failure - read", async () => {
    spyOn(fs, "access").mockImplementation(async (_, mode) => {
      if (mode === fs.constants.R_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: path, permissions: { read: true } },
      deps,
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("File is not readable"));
  });

  test("failure - write", async () => {
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.W_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: path, permissions: { read: true, write: true } },
      deps,
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("File is not writable"));
  });

  test("failure - execute", async () => {
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.X_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteVerifierFileAdapter(
      { file: path, permissions: { read: true, write: true, execute: true } },
      deps,
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("File is not executable"));
  });

  test("integration - BUILD_INFO_REPOSITORY_FILE_PATH", async () => {
    const fileInspectionExists = spyOn(FileInspection, "exists");
    const prerequisite = new PrerequisiteVerifierFileAdapter({ file: BUILD_INFO_REPOSITORY_FILE_PATH }, deps);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
    expect(fileInspectionExists).toHaveBeenCalledWith("infra/build-info.json");
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierFileAdapter({ file: path }, deps);

    expect(prerequisite.kind).toEqual("file");
  });
});
