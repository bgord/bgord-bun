import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileCleanerForgivingAdapter } from "../src/file-cleaner-forgiving.adapter";
import * as mocks from "./mocks";

const deleter = { delete: async () => ({}) };

const FileCleaner = new FileCleanerForgivingAdapter();

describe("FileCleanerForgivingAdapter", () => {
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

  test("swallows an error", () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");
    using _ = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    expect(async () => FileCleaner.delete(path)).not.toThrow();
  });
});
