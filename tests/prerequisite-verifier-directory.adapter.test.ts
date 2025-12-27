import { describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierDirectoryAdapter } from "../src/prerequisite-verifier-directory.adapter";
import * as mocks from "./mocks";

const directory = tools.DirectoryPathAbsoluteSchema.parse("/var/app/uploads");

describe("PrerequisiteVerifierDirectoryAdapter", () => {
  test("success", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({
      directory,
      permissions: { read: true, write: true, execute: true },
    });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - does not exist", async () => {
    spyOn(fs, "stat").mockRejectedValue(new Error("ENOENT"));
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({ directory });

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: "Directory does not exist" }),
    );
  });

  test("failure - not a directory", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => false } as any);
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({ directory });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "Not a directory" }));
  });

  test("failure - read permission", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.R_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({ directory, permissions: { read: true } });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "Directory is not readable" }));
  });

  test("failure - write permission", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.W_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({
      directory,
      permissions: { write: true },
    });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "Directory is not writable" }));
  });

  test("failure - execute permission", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.X_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({
      directory,
      permissions: { execute: true },
    });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "Directory is not executable" }));
  });
});
