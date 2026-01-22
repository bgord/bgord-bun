import { describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierDirectoryAdapter } from "../src/prerequisite-verifier-directory.adapter";

const directory = tools.DirectoryPathAbsoluteSchema.parse("/var/app/uploads");

describe("PrerequisiteVerifierDirectoryAdapter", () => {
  test("success - all", async () => {
    // @ts-expect-error TODO
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true });
    const FileInspection = new FileInspectionNoopAdapter({
      exists: true,
      permissions: { read: true, write: true, execute: true },
    });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter(
      { directory, permissions: { read: true, write: true, execute: true } },
      { FileInspection },
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("success - read", async () => {
    // @ts-expect-error TODO
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true });
    const FileInspection = new FileInspectionNoopAdapter({
      exists: true,
      permissions: { read: true, write: false, execute: false },
    });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter(
      { directory, permissions: { read: true } },
      { FileInspection },
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("success - write", async () => {
    // @ts-expect-error TODO
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true });
    const FileInspection = new FileInspectionNoopAdapter({
      exists: true,
      permissions: { read: false, write: true, execute: false },
    });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter(
      { directory, permissions: { write: true } },
      { FileInspection },
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("success - execute", async () => {
    // @ts-expect-error TODO
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true });
    const FileInspection = new FileInspectionNoopAdapter({
      exists: true,
      permissions: { read: false, write: false, execute: true },
    });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter(
      { directory, permissions: { execute: true } },
      { FileInspection },
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - does not exist", async () => {
    spyOn(fs, "stat").mockRejectedValue(new Error("ENOENT"));
    const FileInspection = new FileInspectionNoopAdapter({ exists: false });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({ directory }, { FileInspection });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("Directory does not exist"));
  });

  test("failure - not a directory", async () => {
    // @ts-expect-error TODO
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => false });
    const FileInspection = new FileInspectionNoopAdapter({ exists: true });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({ directory }, { FileInspection });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("Not a directory"));
  });

  test("failure - read", async () => {
    // @ts-expect-error TODO
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true });
    const FileInspection = new FileInspectionNoopAdapter({ exists: true, permissions: { read: false } });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter(
      { directory, permissions: { read: true } },
      { FileInspection },
    );

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("Directory is not readable"),
    );
  });

  test("failure - write", async () => {
    // @ts-expect-error TODO
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true });
    const FileInspection = new FileInspectionNoopAdapter({ exists: true, permissions: { write: false } });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter(
      { directory, permissions: { write: true } },
      { FileInspection },
    );

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("Directory is not writable"),
    );
  });

  test("failure - execute", async () => {
    // @ts-expect-error TODO
    spyOn(fs, "stat").mockResolvedValue({ isDirectory: () => true });
    const FileInspection = new FileInspectionNoopAdapter({ exists: true, permissions: { execute: false } });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter(
      { directory, permissions: { execute: true } },
      { FileInspection },
    );

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("Directory is not executable"),
    );
  });

  test("kind", () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: true });
    const prerequisite = new PrerequisiteVerifierDirectoryAdapter({ directory }, { FileInspection });

    expect(prerequisite.kind).toEqual("directory");
  });
});
