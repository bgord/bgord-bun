import { describe, expect, spyOn, test } from "bun:test";
import * as mocks from "./mocks";
import * as tools from "@bgord/tools";
import * as fs from "node:fs/promises";
import { FileInspectionAdapter } from "../src/file-inspection.adapter";

const adapter = new FileInspectionAdapter();

describe("FileInspectionAdapter", () => {
  test("exists - true - string", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => true });
    const path = "package.json";

    expect(await adapter.exists(path)).toEqual(true);
    expect(bunFile).toHaveBeenCalledWith("package.json");
  });

  test("exist - true - relative", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => true });
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.exists(path)).toEqual(true);
    expect(bunFile).toHaveBeenCalledWith("users/package.json");
  });

  test("exist - true - absolute", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => true });
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.exists(path)).toEqual(true);
    expect(bunFile).toHaveBeenCalledWith("/users/package.json");
  });

  test("exists - false - string", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => false });
    const path = "package.json";

    expect(await adapter.exists(path)).toEqual(false);
    expect(bunFile).toHaveBeenCalledWith("package.json");
  });

  test("exist - false - relative", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => false });
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.exists(path)).toEqual(false);
    expect(bunFile).toHaveBeenCalledWith("users/package.json");
  });

  test("exist - false - absolute", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => false });
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.exists(path)).toEqual(false);
    expect(bunFile).toHaveBeenCalledWith("/users/package.json");
  });

  test("canRead - true - string", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const path = "package.json";

    expect(await adapter.canRead(path)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("package.json", 4);
  });

  test("canRead - true - relative", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.canRead(path)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("users/package.json", 4);
  });

  test("canRead - true - absolute", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.canRead(path)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("/users/package.json", 4);
  });

  test("canWrite - true - string", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const path = "package.json";

    expect(await adapter.canWrite(path)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("package.json", 2);
  });

  test("canWrite - true - relative", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.canWrite(path)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("users/package.json", 2);
  });

  test("canWrite - true - absolute", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.canWrite(path)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("/users/package.json", 2);
  });

  test("canExecute - true - string", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const path = "package.json";

    expect(await adapter.canExecute(path)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("package.json", 1);
  });

  test("canExecute - true - relative", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.canExecute(path)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("users/package.json", 1);
  });

  test("canExecute - true - absolute", async () => {
    const fsAccess = spyOn(fs, "access").mockResolvedValue(undefined);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.canExecute(path)).toEqual(true);
    expect(fsAccess).toHaveBeenCalledWith("/users/package.json", 1);
  });

  test("canRead - false - string", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);
    const path = "package.json";

    expect(await adapter.canRead(path)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("package.json", 4);
  });

  test("canRead - false - relative", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.canRead(path)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("users/package.json", 4);
  });

  test("canRead - false - absolute", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.canRead(path)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("/users/package.json", 4);
  });

  test("canWrite - false - string", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);
    const path = "package.json";

    expect(await adapter.canWrite(path)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("package.json", 2);
  });

  test("canWrite - false - relative", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.canWrite(path)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("users/package.json", 2);
  });

  test("canWrite - false - absolute", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.canWrite(path)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("/users/package.json", 2);
  });

  test("canExecute - false - string", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);
    const path = "package.json";

    expect(await adapter.canExecute(path)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("package.json", 1);
  });

  test("canExecute - false - relative", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.canExecute(path)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("users/package.json", 1);
  });

  test("canExecute - false - absolute", async () => {
    const fsAccess = spyOn(fs, "access").mockImplementation(mocks.throwIntentionalErrorAsync);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.canExecute(path)).toEqual(false);
    expect(fsAccess).toHaveBeenCalledWith("/users/package.json", 1);
  });
});
