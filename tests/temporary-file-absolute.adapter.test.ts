import { describe, expect, jest, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { TemporaryFileAbsolute } from "../src/temporary-file-absolute.adapter";
import * as mocks from "./mocks";

const directory = tools.DirectoryPathAbsoluteSchema.parse("/tmp/bgord-tests");
const adapter = new TemporaryFileAbsolute(directory);

const filename = tools.Filename.fromString("avatar.webp");

const partial = tools.FilePathAbsolute.fromPartsSafe(directory, filename.withSuffix("-part")).get();
const final = tools.FilePathAbsolute.fromPartsSafe(directory, filename).get();

const content = new File([new TextEncoder().encode("hello")], "ignored.bin", {
  type: "application/octet-stream",
});

describe("TemporaryFileAbsolute adapter", () => {
  test("write - create a partial, rename, return final path", async () => {
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
    const fsUnlinkSpy = spyOn(fs, "unlink").mockImplementation(jest.fn());

    await adapter.cleanup(filename);

    expect(fsUnlinkSpy).toHaveBeenCalledTimes(1);
    expect(fsUnlinkSpy).toHaveBeenCalledWith(final);
  });
});
