import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { FileRenamerFsAdapter } from "../src/file-renamer-fs.adapter";
import * as mocks from "./mocks";

const renamer = { delete: async () => ({}) } as any;

const adapter = new FileRenamerFsAdapter();

describe("FileRenamerFsAdapter", () => {
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
    spyOn(fs, "rename").mockRejectedValue(new Error(mocks.IntentionalError));
    const input = tools.FilePathAbsolute.fromString("/users/package.json");
    const output = tools.FilePathAbsolute.fromString("/users/package-lock.json");

    expect(async () => adapter.rename(input, output)).toThrow();
  });
});
