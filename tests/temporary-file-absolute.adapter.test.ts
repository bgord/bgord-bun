import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";
import { TemporaryFileAbsoluteAdapter } from "../src/temporary-file-absolute.adapter";
import * as mocks from "./mocks";

const content = new File([new TextEncoder().encode("hello")], "ignored.bin", {
  type: "application/octet-stream",
});
const directory = tools.DirectoryPathAbsoluteSchema.parse("/tmp/bgord-tests");
const filename = tools.Filename.fromString("avatar.webp");
const partial = tools.FilePathAbsolute.fromPartsSafe(directory, filename.withSuffix("-part"));
const final = tools.FilePathAbsolute.fromPartsSafe(directory, filename);

const FileCleaner = new FileCleanerNoopAdapter();
const FileRenamer = new FileRenamerNoopAdapter();
const FileWriter = new FileWriterNoopAdapter();
const deps = { FileCleaner, FileRenamer, FileWriter };

const adapter = new TemporaryFileAbsoluteAdapter(directory, deps);

describe("TemporaryFileAbsoluteAdapter", () => {
  test("write", async () => {
    const fileWriterWrite = spyOn(FileWriter, "write");
    const fileRenamerRename = spyOn(FileRenamer, "rename");

    const path = await adapter.write(filename, content);

    expect(fileWriterWrite).toHaveBeenCalledWith(partial.get(), content);
    expect(fileRenamerRename).toHaveBeenCalledWith(partial, final);
    expect(path).toEqual(final);
  });

  test("write - write error", async () => {
    spyOn(FileWriter, "write").mockImplementation(mocks.throwIntentionalErrorAsync);
    const fileRenamerRename = spyOn(FileRenamer, "rename");

    expect(adapter.write(filename, content)).rejects.toThrow(mocks.IntentionalError);
    expect(fileRenamerRename).not.toHaveBeenCalled();
  });

  test("write - renamer error", async () => {
    spyOn(FileRenamer, "rename").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(adapter.write(filename, content)).rejects.toThrow(mocks.IntentionalError);
  });

  test("cleanup", async () => {
    const fileCleanerDelete = spyOn(FileCleaner, "delete");

    await adapter.cleanup(filename);

    expect(fileCleanerDelete).toHaveBeenCalledWith(final);
  });

  test("get root", () => {
    expect(adapter.root).toEqual(directory);
  });
});
