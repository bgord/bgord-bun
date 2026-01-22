import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { FileRenamerFsForgivingAdapter } from "../src/file-renamer-fs-forgiving.adapter";
import * as mocks from "./mocks";

const renamer = {};

const adapter = new FileRenamerFsForgivingAdapter();

describe("FileRenamerFsForgivingAdapter", () => {
  test("happy path - string", async () => {
    const fsRename = spyOn(fs, "rename").mockReturnValue(renamer);
    const input = "package.json";
    const output = "package-lock.json";

    expect(async () => adapter.rename(input, output)).not.toThrow();
    expect(fsRename).toHaveBeenCalledWith(input, output);
  });

  test("happy path - relative", async () => {
    const fsRename = spyOn(fs, "rename").mockReturnValue(renamer);
    const input = tools.FilePathRelative.fromString("users/package.json");
    const output = tools.FilePathRelative.fromString("users/package-lock.json");

    expect(async () => adapter.rename(input, output)).not.toThrow();
    expect(fsRename).toHaveBeenCalledWith(input.get(), output.get());
  });

  test("happy path - absolute", async () => {
    const fsRename = spyOn(fs, "rename").mockReturnValue(renamer);
    const input = tools.FilePathAbsolute.fromString("/users/package.json");
    const output = tools.FilePathAbsolute.fromString("/users/package-lock.json");

    expect(async () => adapter.rename(input, output)).not.toThrow();
    expect(fsRename).toHaveBeenCalledWith(input.get(), output.get());
  });

  test("throw an error", () => {
    spyOn(fs, "rename").mockImplementation(mocks.throwIntentionalErrorAsync);
    const input = tools.FilePathAbsolute.fromString("/users/package.json");
    const output = tools.FilePathAbsolute.fromString("/users/package-lock.json");

    expect(async () => adapter.rename(input, output)).not.toThrow();
  });
});
