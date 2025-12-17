import { describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteDirectory } from "../src/prerequisites/directory";
import * as mocks from "./mocks";

const directory = tools.DirectoryPathAbsoluteSchema.parse("/var/app/uploads");

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteDirectory", () => {
  test("success", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteDirectory({
      label: "dir",
      directory,
      permissions: { read: true, write: true, execute: true },
    });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("failure - does not exist", async () => {
    spyOn(fs, "stat").mockRejectedValue(new Error("ENOENT"));
    const prerequisite = new PrerequisiteDirectory({ label: "dir", directory });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "Directory does not exist" }),
    );
  });

  test("failure - not a directory", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => false } as any);
    const prerequisite = new PrerequisiteDirectory({ label: "dir", directory });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "Not a directory" }),
    );
  });

  test("failure - read permission", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.R_OK) throw new Error(mocks.IntentialError);
      return undefined;
    });
    const prerequisite = new PrerequisiteDirectory({ label: "dir", directory, permissions: { read: true } });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "Directory is not readable" }),
    );
  });

  test("failure - write permission", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.W_OK) throw new Error(mocks.IntentialError);
      return undefined;
    });
    const prerequisite = new PrerequisiteDirectory({ label: "dir", directory, permissions: { write: true } });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "Directory is not writable" }),
    );
  });

  test("failure - execute permission", async () => {
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.X_OK) throw new Error(mocks.IntentialError);
      return undefined;
    });
    const prerequisite = new PrerequisiteDirectory({
      label: "dir",
      directory,
      permissions: { execute: true },
    });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "Directory is not executable" }),
    );
  });

  test("undetermined - prerequisite disabled", async () => {
    const prerequisite = new PrerequisiteDirectory({ label: "dir", directory, enabled: false });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationUndetermined);
  });
});
