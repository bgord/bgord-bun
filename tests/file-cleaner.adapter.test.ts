import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileCleanerAdapter } from "../src/file-cleaner.adapter";
import * as mocks from "./mocks";

const deleter = { delete: async () => ({}) };

const FileCleaner = new FileCleanerAdapter();

describe("FileCleanerAdapter", () => {
  test("happy path - string", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(deleter);
    const path = "package.json";

    expect(async () => FileCleaner.delete(path)).not.toThrow();
    expect(bunFile).toHaveBeenCalledWith(path);
  });

  test("happy path - relative", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(deleter);
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(async () => FileCleaner.delete(path)).not.toThrow();
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - absolute", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(deleter);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(async () => FileCleaner.delete(path)).not.toThrow();
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("throw an error", () => {
    using _ = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(async () => FileCleaner.delete(path)).toThrow();
  });
});
