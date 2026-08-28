import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { FileRenamerNodeForgivingAdapter } from "../src/file-renamer-node-forgiving.adapter";
import * as mocks from "./mocks";
import * as testcases from "./testcases";

const renamer = async () => {};

const adapter = new FileRenamerNodeForgivingAdapter();

describe("FileRenamerNodeForgivingAdapter", () => {
  test("happy path - string", async () => {
    using fsRename = spyOn(fs, "rename").mockImplementation(renamer);
    const output = "package-lock.json";

    expect(async () => adapter.rename(testcases.file.input.string, output)).not.toThrow();
    expect(fsRename).toHaveBeenCalledWith(testcases.file.input.string, output);
  });

  test("happy path - relative", async () => {
    using fsRename = spyOn(fs, "rename").mockImplementation(renamer);
    const output = tools.FilePathRelative.fromString("users/package-lock.json");

    expect(async () => adapter.rename(testcases.file.input.relative, output)).not.toThrow();
    expect(fsRename).toHaveBeenCalledWith(testcases.file.input.relative.get(), output.get());
  });

  test("happy path - absolute", async () => {
    using fsRename = spyOn(fs, "rename").mockImplementation(renamer);
    const output = tools.FilePathAbsolute.fromString("/users/package-lock.json");

    expect(async () => adapter.rename(testcases.file.input.absolute, output)).not.toThrow();
    expect(fsRename).toHaveBeenCalledWith(testcases.file.input.absolute.get(), output.get());
  });

  test("throw an error", () => {
    using _fsRename = spyOn(fs, "rename").mockImplementation(mocks.throwIntentionalErrorAsync);
    const output = tools.FilePathAbsolute.fromString("/users/package-lock.json");

    expect(async () => adapter.rename(testcases.file.input.absolute, output)).not.toThrow();
  });
});
