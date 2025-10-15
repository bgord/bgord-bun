import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileCleanerBunForgivingAdapter } from "../src/file-cleaner-bun-forgiving.adapter";
import * as mocks from "./mocks";

const FileCleaner = new FileCleanerBunForgivingAdapter();

const deleter = { delete: async () => ({}) } as any;

describe("FileCleanerBunForgivingAdapter", () => {
  test("happy path - string", async () => {
    const bunFileSpy = spyOn(Bun, "file").mockReturnValue(deleter);

    const path = "package.json";

    expect(async () => FileCleaner.delete(path)).not.toThrow();
    expect(bunFileSpy).toHaveBeenCalledWith(path);
  });

  test("happy path - relative", async () => {
    const bunFileSpy = spyOn(Bun, "file").mockReturnValue(deleter);

    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(async () => FileCleaner.delete(path)).not.toThrow();
    expect(bunFileSpy).toHaveBeenCalledWith(path.get());
  });

  test("happy path - absolute", async () => {
    const bunFileSpy = spyOn(Bun, "file").mockReturnValue(deleter);

    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(async () => FileCleaner.delete(path)).not.toThrow();
    expect(bunFileSpy).toHaveBeenCalledWith(path.get());
  });

  test("swallows an error", () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockRejectedValue(new Error(mocks.IntentialError));

    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(async () => FileCleaner.delete(path)).not.toThrow();
  });
});
