import { describe, expect, jest, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { TemporaryFileAbsolute } from "../src/temporary-file-absolute.adapter";
import * as mocks from "./mocks";

const directory = tools.DirectoryPathAbsoluteSchema.parse("/tmp/bgord-tests");

const FileCleaner = new FileCleanerNoopAdapter();
const deps = { FileCleaner };

const adapter = new TemporaryFileAbsolute(directory, deps);

const filename = tools.Filename.fromString("avatar.webp");

const partial = tools.FilePathAbsolute.fromPartsSafe(directory, filename.withSuffix("-part")).get();
const final = tools.FilePathAbsolute.fromPartsSafe(directory, filename).get();

const content = new File([new TextEncoder().encode("hello")], "ignored.bin", {
  type: "application/octet-stream",
});

describe("TemporaryFileAbsolute adapter", () => {
  test("write", async () => {
    const bunWriteSpy = spyOn(Bun, "write").mockImplementation(jest.fn());
    const fsRenameSpy = spyOn(fs, "rename").mockResolvedValue();

    const { path } = await adapter.write(filename, content);

    expect(bunWriteSpy).toHaveBeenCalledTimes(1);
    expect(bunWriteSpy).toHaveBeenCalledWith(partial, content);
    expect(fsRenameSpy).toHaveBeenCalledTimes(1);
    expect(fsRenameSpy).toHaveBeenCalledWith(partial, final);
    expect(path.get()).toEqual(final);
  });

  test("write - Bun.write error", async () => {
    const bunWriteSpy = spyOn(Bun, "write").mockRejectedValue(new Error(mocks.IntentialError));
    const fsRenameSpy = spyOn(fs, "rename").mockResolvedValue();

    expect(adapter.write(filename, content)).rejects.toThrow(mocks.IntentialError);
    expect(bunWriteSpy).toHaveBeenCalledWith(partial, content);
    expect(fsRenameSpy).not.toHaveBeenCalled();
  });

  test("write - fs.rename error", async () => {
    const bunWriteSpy = spyOn(Bun, "write").mockImplementation(jest.fn());
    const fsRenameSpy = spyOn(fs, "rename").mockRejectedValue(new Error(mocks.IntentialError));

    expect(adapter.write(filename, content)).rejects.toThrow(mocks.IntentialError);
    expect(bunWriteSpy).toHaveBeenCalledWith(partial, content);
    expect(fsRenameSpy).toHaveBeenCalledWith(partial, final);
  });

  test("cleanup", async () => {
    const fileCleanerSpy = spyOn(FileCleaner, "delete");

    await adapter.cleanup(filename);

    // @ts-expect-error
    expect(fileCleanerSpy.mock.calls[0][0].get()).toEqual(final);
  });
});
