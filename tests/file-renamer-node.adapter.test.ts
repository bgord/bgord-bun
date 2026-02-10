import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { FileRenamerNodeAdapter } from "../src/file-renamer-node.adapter";
import * as mocks from "./mocks";

const renamer = async () => {};

const adapter = new FileRenamerNodeAdapter();

describe("FileRenamerNodeAdapter", () => {
  test("happy path - string", async () => {
    const input = "package.json";
    const output = "package-lock.json";
    using fsRename = spyOn(fs, "rename").mockImplementation(renamer);

    expect(async () => adapter.rename(input, output)).not.toThrow();
    expect(fsRename).toHaveBeenCalledWith(input, output);
  });

  test("happy path - relative", async () => {
    const input = tools.FilePathRelative.fromString("users/package.json");
    const output = tools.FilePathRelative.fromString("users/package-lock.json");
    using fsRename = spyOn(fs, "rename").mockImplementation(renamer);

    expect(async () => adapter.rename(input, output)).not.toThrow();
    expect(fsRename).toHaveBeenCalledWith(input.get(), output.get());
  });

  test("happy path - absolute", async () => {
    const input = tools.FilePathAbsolute.fromString("/users/package.json");
    const output = tools.FilePathAbsolute.fromString("/users/package-lock.json");
    using fsRename = spyOn(fs, "rename").mockImplementation(renamer);

    expect(async () => adapter.rename(input, output)).not.toThrow();
    expect(fsRename).toHaveBeenCalledWith(input.get(), output.get());
  });

  test("throw an error", () => {
    const input = tools.FilePathAbsolute.fromString("/users/package.json");
    const output = tools.FilePathAbsolute.fromString("/users/package-lock.json");
    using _ = spyOn(fs, "rename").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.rename(input, output)).toThrow();
  });
});
