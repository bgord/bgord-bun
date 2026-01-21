import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileCleanerBunForgivingAdapter } from "../src/file-cleaner-bun-forgiving.adapter";
import * as mocks from "./mocks";

const deleter = { delete: async () => ({}) } as any;

const FileCleaner = new FileCleanerBunForgivingAdapter();

describe("FileCleanerBunForgivingAdapter", () => {
  test("happy path - string", async () => {
    const bunFile = spyOn(Bun, "file").mockReturnValue(deleter);
    const path = "package.json";

    expect(async () => FileCleaner.delete(path)).not.toThrow();
    expect(bunFile).toHaveBeenCalledWith(path);
  });

  test("happy path - relative", async () => {
    const bunFile = spyOn(Bun, "file").mockReturnValue(deleter);
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(async () => FileCleaner.delete(path)).not.toThrow();
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - absolute", async () => {
    const bunFile = spyOn(Bun, "file").mockReturnValue(deleter);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(async () => FileCleaner.delete(path)).not.toThrow();
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("swallows an error", () => {
    spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(async () => FileCleaner.delete(path)).not.toThrow();
  });
});
