import { describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { BUILD_INFO_REPOSITORY_FILE_PATH } from "../src/build-info-repository-file.strategy";
import { PrerequisiteVerifierFileAdapter } from "../src/prerequisite-verifier-file.adapter";
import * as mocks from "./mocks";

const path = tools.FilePathAbsolute.fromString("/tmp/test-file.txt");

describe("PrerequisiteVerifierFileAdapter", () => {
  test("success - all", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteVerifierFileAdapter({
      file: path,
      permissions: { read: true, write: true, execute: true },
    });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("success - read", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteVerifierFileAdapter({ file: path, permissions: { read: true } });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationSuccess);
    expect(fsAccess).toHaveBeenCalledTimes(1);
    expect(fsAccess).toHaveBeenCalledWith(path.get(), fs.constants.R_OK);
  });

  test("success - write", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteVerifierFileAdapter({ file: path, permissions: { write: true } });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationSuccess);
    expect(fsAccess).toHaveBeenCalledTimes(1);
    expect(fsAccess).toHaveBeenCalledWith(path.get(), fs.constants.W_OK);
  });

  test("success - execute", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteVerifierFileAdapter({ file: path, permissions: { execute: true } });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationSuccess);
    expect(fsAccess).toHaveBeenCalledTimes(1);
    expect(fsAccess).toHaveBeenCalledWith(path.get(), fs.constants.X_OK);
  });

  test("failure - file does not exist", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => false } as any);
    const prerequisite = new PrerequisiteVerifierFileAdapter({ file: path });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "File does not exist" }));
  });

  test("failure - read", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_, mode) => {
      if (mode === fs.constants.R_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteVerifierFileAdapter({ file: path, permissions: { read: true } });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "File is not readable" }));
  });

  test("failure - write", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.W_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteVerifierFileAdapter({
      file: path,
      permissions: { read: true, write: true },
    });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "File is not writable" }));
  });

  test("failure - execute", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.X_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteVerifierFileAdapter({
      file: path,
      permissions: { read: true, write: true, execute: true },
    });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "File is not executable" }));
  });

  test("integration - BUILD_INFO_REPOSITORY_FILE_PATH", async () => {
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    const prerequisite = new PrerequisiteVerifierFileAdapter({ file: BUILD_INFO_REPOSITORY_FILE_PATH });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationSuccess);
    expect(bunFile).toHaveBeenCalledWith("infra/build-info.json");
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierFileAdapter({
      file: path,
      permissions: { read: true, write: true, execute: true },
    });

    expect(prerequisite.kind).toEqual("file");
  });
});
