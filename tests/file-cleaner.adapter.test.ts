import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileCleanerAdapter } from "../src/file-cleaner.adapter";
import * as mocks from "./mocks";

const deleter = { delete: async () => ({}) };

const FileCleaner = new FileCleanerAdapter();

describe("FileCleanerAdapter", () => {
  test("happy path - string", async () => {
    const path = "package.json";
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(deleter);

    expect(async () => FileCleaner.delete(path)).not.toThrow();
    expect(bunFile).toHaveBeenCalledWith(path);
  });

  test("happy path - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.json");
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(deleter);

    expect(async () => FileCleaner.delete(path)).not.toThrow();
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(deleter);

    expect(async () => FileCleaner.delete(path)).not.toThrow();
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("throw an error", () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");
    using _ = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    expect(async () => FileCleaner.delete(path)).toThrow();
  });
});
