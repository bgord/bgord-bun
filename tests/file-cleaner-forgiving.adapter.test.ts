import { describe, expect, spyOn, test } from "bun:test";
import { FileCleanerForgivingAdapter } from "../src/file-cleaner-forgiving.adapter";
import * as mocks from "./mocks";
import * as testcases from "./testcases";

const deleter = { delete: async () => ({}) };

const FileCleaner = new FileCleanerForgivingAdapter();

describe("FileCleanerForgivingAdapter", () => {
  test("happy path - string", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(deleter);

    expect(async () => FileCleaner.delete(testcases.file.input.string)).not.toThrow();
    expect(bunFile).toHaveBeenCalledWith(testcases.file.input.string);
  });

  test("happy path - relative", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(deleter);

    expect(async () => FileCleaner.delete(testcases.file.input.relative)).not.toThrow();
    expect(bunFile).toHaveBeenCalledWith(testcases.file.input.relative.get());
  });

  test("happy path - absolute", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(deleter);

    expect(async () => FileCleaner.delete(testcases.file.input.absolute)).not.toThrow();
    expect(bunFile).toHaveBeenCalledWith(testcases.file.input.absolute.get());
  });

  test("swallows an error", () => {
    using _ = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    expect(async () => FileCleaner.delete(testcases.file.input.absolute)).not.toThrow();
  });
});
