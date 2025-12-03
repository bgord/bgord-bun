import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileCleanerBunAdapter } from "../src/file-cleaner-bun.adapter";
import * as mocks from "./mocks";

const FileCleaner = new FileCleanerBunAdapter();

const deleter = { delete: async () => ({}) } as any;

describe("FileCleanerBunAdapter", () => {
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

  test("throw an error", () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockRejectedValue(new Error(mocks.IntentialError));

    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(async () => FileCleaner.delete(path)).toThrow();
  });
});
