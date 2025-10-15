import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { TemporaryFileAbsolute } from "../src/temporary-file-absolute.adapter";
import * as mocks from "./mocks";

const directory = tools.DirectoryPathAbsoluteSchema.parse("/tmp/bgord-tests");

const FileCleaner = new FileCleanerNoopAdapter();
const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileCleaner, FileRenamer };

const adapter = new TemporaryFileAbsolute(directory, deps);

const filename = tools.Filename.fromString("avatar.webp");

const partial = tools.FilePathAbsolute.fromPartsSafe(directory, filename.withSuffix("-part"));
const final = tools.FilePathAbsolute.fromPartsSafe(directory, filename);

const content = new File([new TextEncoder().encode("hello")], "ignored.bin", {
  type: "application/octet-stream",
});

describe("TemporaryFileAbsolute adapter", () => {
  test("write", async () => {
    const bunWriteSpy = spyOn(Bun, "write").mockImplementation(jest.fn());
    const renameSpy = spyOn(FileRenamer, "rename");

    const { path } = await adapter.write(filename, content);

    expect(bunWriteSpy).toHaveBeenCalledWith(partial.get(), content);
    expect(renameSpy).toHaveBeenCalledWith(partial, final);
    expect(path).toEqual(final);
  });

  test("write - Bun.write error", async () => {
    const bunWriteSpy = spyOn(Bun, "write").mockRejectedValue(new Error(mocks.IntentialError));
    const renameSpy = spyOn(FileRenamer, "rename");

    expect(adapter.write(filename, content)).rejects.toThrow(mocks.IntentialError);
    expect(bunWriteSpy).toHaveBeenCalledWith(partial.get(), content);
    expect(renameSpy).not.toHaveBeenCalled();
  });

  test("write - FileRenamer error", async () => {
    const bunWriteSpy = spyOn(Bun, "write").mockImplementation(jest.fn());
    const renameSpy = spyOn(FileRenamer, "rename").mockRejectedValue(new Error(mocks.IntentialError));

    expect(adapter.write(filename, content)).rejects.toThrow(mocks.IntentialError);
    expect(bunWriteSpy).toHaveBeenCalledWith(partial.get(), content);
    expect(renameSpy).toHaveBeenCalledWith(partial, final);
  });

  test("cleanup", async () => {
    const fileCleanerSpy = spyOn(FileCleaner, "delete");

    await adapter.cleanup(filename);

    expect(fileCleanerSpy).toHaveBeenCalledWith(final);
  });
});
