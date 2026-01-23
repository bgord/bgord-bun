import { describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { FileInspectionAdapter } from "../src/file-inspection.adapter";
import * as mocks from "./mocks";

const adapter = new FileInspectionAdapter();

const string = "package.json";
const relative = tools.FilePathRelative.fromString("users/package.json");
const absolute = tools.FilePathAbsolute.fromString("/users/package.json");

describe("FileInspectionAdapter", () => {
  test("exists - true - string", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => true });

    expect(await adapter.exists(string)).toEqual(true);
    expect(bunFile).toHaveBeenCalledWith("package.json");
  });

  test("exist - true - relative", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => true });

    expect(await adapter.exists(relative)).toEqual(true);
    expect(bunFile).toHaveBeenCalledWith("users/package.json");
  });

  test("exist - true - absolute", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => true });

    expect(await adapter.exists(absolute)).toEqual(true);
    expect(bunFile).toHaveBeenCalledWith("/users/package.json");
  });

  test("exists - false - string", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => false });

    expect(await adapter.exists(string)).toEqual(false);
    expect(bunFile).toHaveBeenCalledWith("package.json");
  });

  test("exist - false - relative", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => false });

    expect(await adapter.exists(relative)).toEqual(false);
    expect(bunFile).toHaveBeenCalledWith("users/package.json");
  });

  test("exist - false - absolute", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => false });

    expect(await adapter.exists(absolute)).toEqual(false);
    expect(bunFile).toHaveBeenCalledWith("/users/package.json");
  });

  test("canRead - true - string", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);

    expect(await adapter.canRead(string)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("package.json", 4);
  });

  test("canRead - true - relative", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);

    expect(await adapter.canRead(relative)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("users/package.json", 4);
  });

  test("canRead - true - absolute", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);

    expect(await adapter.canRead(absolute)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("/users/package.json", 4);
  });

  test("canWrite - true - string", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);

    expect(await adapter.canWrite(string)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("package.json", 2);
  });

  test("canWrite - true - relative", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);

    expect(await adapter.canWrite(relative)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("users/package.json", 2);
  });

  test("canWrite - true - absolute", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);

    expect(await adapter.canWrite(absolute)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("/users/package.json", 2);
  });

  test("canExecute - true - string", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);

    expect(await adapter.canExecute(string)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("package.json", 1);
  });

  test("canExecute - true - relative", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);

    expect(await adapter.canExecute(relative)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("users/package.json", 1);
  });

  test("canExecute - true - absolute", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);

    expect(await adapter.canExecute(absolute)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("/users/package.json", 1);
  });

  test("canRead - false - string", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(await adapter.canRead(string)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("package.json", 4);
  });

  test("canRead - false - relative", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(await adapter.canRead(relative)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("users/package.json", 4);
  });

  test("canRead - false - absolute", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(await adapter.canRead(absolute)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("/users/package.json", 4);
  });

  test("canWrite - false - string", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(await adapter.canWrite(string)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("package.json", 2);
  });

  test("canWrite - false - relative", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(await adapter.canWrite(relative)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("users/package.json", 2);
  });

  test("canWrite - false - absolute", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(await adapter.canWrite(absolute)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("/users/package.json", 2);
  });

  test("canExecute - false - string", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(await adapter.canExecute(string)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("package.json", 1);
  });

  test("canExecute - false - relative", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(await adapter.canExecute(relative)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("users/package.json", 1);
  });

  test("canExecute - false - absolute", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(await adapter.canExecute(absolute)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("/users/package.json", 1);
  });

  test("isDirectory - true - relative", async () => {
    // @ts-expect-error Partial access
    const fsStat = spyOn(fs, "stat").mockImplementation(async () => ({ isDirectory: () => true }));
    const relative = tools.DirectoryPathRelativeSchema.parse("users");

    expect(await adapter.isDirectory(relative)).toEqual(true);
    expect(fsStat).toHaveBeenCalledWith("users");
  });

  test("isDirectory - true - absolute", async () => {
    // @ts-expect-error Partial access
    const fsStat = spyOn(fs, "stat").mockImplementation(async () => ({ isDirectory: () => true }));
    const absolute = tools.DirectoryPathAbsoluteSchema.parse("/users");

    expect(await adapter.isDirectory(absolute)).toEqual(true);
    expect(fsStat).toHaveBeenCalledWith("/users");
  });

  test("isDirectory - false - error - relative", async () => {
    const fsStat = spyOn(fs, "stat").mockImplementation(mocks.throwIntentionalErrorAsync);
    const relative = tools.DirectoryPathRelativeSchema.parse("users");

    expect(await adapter.isDirectory(relative)).toEqual(false);
    expect(fsStat).toHaveBeenCalledWith("users");
  });

  test("isDirectory - false - error - absolute", async () => {
    const fsStat = spyOn(fs, "stat").mockImplementation(mocks.throwIntentionalErrorAsync);
    const absolute = tools.DirectoryPathAbsoluteSchema.parse("/users");

    expect(await adapter.isDirectory(absolute)).toEqual(false);
    expect(fsStat).toHaveBeenCalledWith("/users");
  });

  test("isDirectory - false - not a directory - relative", async () => {
    // @ts-expect-error Partial access
    const fsStat = spyOn(fs, "stat").mockImplementation(async () => ({ isDirectory: () => false }));
    const relative = tools.DirectoryPathRelativeSchema.parse("users");

    expect(await adapter.isDirectory(relative)).toEqual(false);
    expect(fsStat).toHaveBeenCalledWith("users");
  });

  test("isDirectory - false - not a directory - absolute", async () => {
    // @ts-expect-error Partial access
    const fsStat = spyOn(fs, "stat").mockImplementation(async () => ({ isDirectory: () => false }));
    const absolute = tools.DirectoryPathAbsoluteSchema.parse("/users");

    expect(await adapter.isDirectory(absolute)).toEqual(false);
    expect(fsStat).toHaveBeenCalledWith("/users");
  });

  test("size - string", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ size: 1 });

    expect(await adapter.size(string)).toEqual(tools.Size.fromBytes(1));
    expect(bunFile).toHaveBeenCalledWith("package.json");
  });

  test("size - relative", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ size: 1 });

    expect(await adapter.size(relative)).toEqual(tools.Size.fromBytes(1));
    expect(bunFile).toHaveBeenCalledWith("users/package.json");
  });

  test("size - absolute", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ size: 1 });

    expect(await adapter.size(absolute)).toEqual(tools.Size.fromBytes(1));
    expect(bunFile).toHaveBeenCalledWith("/users/package.json");
  });

  test("size - error - string", async () => {
    spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    expect(async () => adapter.size(string)).toThrow(mocks.IntentionalError);
  });

  test("size - error - relative", async () => {
    spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    expect(async () => adapter.size(relative)).toThrow(mocks.IntentionalError);
  });

  test("size - error - absolute", async () => {
    spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    expect(async () => adapter.size(absolute)).toThrow(mocks.IntentionalError);
  });

  test("size - invalid value - string", async () => {
    // @ts-expect-error Partial access
    spyOn(Bun, "file").mockReturnValue({ size: "invalid" });

    expect(async () => adapter.size(string)).toThrow("size.bytes.invalid");
  });

  test("size - invalid value - relative", async () => {
    // @ts-expect-error Partial access
    spyOn(Bun, "file").mockReturnValue({ size: "invalid" });

    expect(async () => adapter.size(string)).toThrow("size.bytes.invalid");
  });

  test("size - invalid value - absolute", async () => {
    // @ts-expect-error Partial access
    spyOn(Bun, "file").mockReturnValue({ size: "invalid" });

    expect(async () => adapter.size(string)).toThrow("size.bytes.invalid");
  });
});
