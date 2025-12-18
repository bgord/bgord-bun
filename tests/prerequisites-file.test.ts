import { describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteFile } from "../src/prerequisites/file";
import * as mocks from "./mocks";

const path = tools.FilePathAbsolute.fromString("/tmp/test-file.txt");

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteFile", () => {
  test("success", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteFile({
      label: "file",
      file: path,
      permissions: { read: true, write: true, execute: true },
    });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("failure - file does not exist", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => false } as any);
    const prerequisite = new PrerequisiteFile({ label: "file", file: path });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "File does not exist" }),
    );
  });

  test("failure - read permission", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_, mode) => {
      if (mode === fs.constants.R_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteFile({ label: "file", file: path, permissions: { read: true } });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "File is not readable" }),
    );
  });

  test("failure - write permission", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.W_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteFile({
      label: "file",
      file: path,
      permissions: { read: true, write: true },
    });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "File is not writable" }),
    );
  });

  test("failure - execute permission", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_path, mode) => {
      if (mode === fs.constants.X_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteFile({
      label: "file",
      file: path,
      permissions: { read: true, write: true, execute: true },
    });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "File is not executable" }),
    );
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteFile({ label: "file", file: path, enabled: false });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationUndetermined);
  });
});
