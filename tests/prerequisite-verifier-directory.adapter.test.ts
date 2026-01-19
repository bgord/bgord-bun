import { describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierDirectoryAdapter } from "../src/prerequisite-verifier-directory.adapter";
import * as mocks from "./mocks";

const directory = tools.DirectoryPathAbsoluteSchema.parse("/var/app/uploads");

describe("PrerequisiteVerifierDirectoryAdapter", () => {
  test("success - all", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({
      directory,
      permissions: { read: true, write: true, execute: true },
    });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("success - read", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({ directory, permissions: { read: true } });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
    expect(fsAccess).toHaveBeenCalledTimes(1);
    expect(fsAccess).toHaveBeenCalledWith(directory, fs.constants.R_OK);
  });

  test("success - write", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({
      directory,
      permissions: { write: true },
    });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
    expect(fsAccess).toHaveBeenCalledTimes(1);
    expect(fsAccess).toHaveBeenCalledWith(directory, fs.constants.W_OK);
  });

  test("success - execute", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({
      directory,
      permissions: { execute: true },
    });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
    expect(fsAccess).toHaveBeenCalledTimes(1);
    expect(fsAccess).toHaveBeenCalledWith(directory, fs.constants.X_OK);
  });

  test("failure - does not exist", async () => {
    spyOn(fs, "stat").mockRejectedValue(new Error("ENOENT"));
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({ directory });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("Directory does not exist"));
  });

  test("failure - not a directory", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => false } as any);
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({ directory });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("Not a directory"));
  });

  test("failure - read", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.R_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({ directory, permissions: { read: true } });

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("Directory is not readable"),
    );
  });

  test("failure - write", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.W_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({
      directory,
      permissions: { write: true },
    });

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("Directory is not writable"),
    );
  });

  test("failure - execute", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.X_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({
      directory,
      permissions: { execute: true },
    });

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("Directory is not executable"),
    );
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({
      directory,
      permissions: { read: true, write: true, execute: true },
    });

    expect(prerequisite.kind).toEqual("directory");
  });
});
