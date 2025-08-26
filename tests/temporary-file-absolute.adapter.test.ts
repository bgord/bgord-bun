import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { TemporaryFileAbsolute } from "../src/temporary-file-absolute.adapter";

const base = tools.DirectoryPathAbsoluteSchema.parse("/tmp/bgord-tests");
const adapter = new TemporaryFileAbsolute(base);
const filename = tools.Filename.fromString("avatar.webp");

const partPath = tools.FilePathAbsolute.fromPartsSafe(base, filename.withSuffix("-part")).get();
const finalPath = tools.FilePathAbsolute.fromPartsSafe(base, filename).get();

describe("TemporaryFileAbsolute", () => {
  test("write performs atomic .part write then rename and returns final AbsoluteFilePath", async () => {
    const fileData = new File([new TextEncoder().encode("hello")], "ignored.bin", {
      type: "application/octet-stream",
    });

    const writeSpy = spyOn(Bun, "write").mockResolvedValue(5 as any);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue();

    const { path } = await adapter.write(filename, fileData);

    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(writeSpy).toHaveBeenCalledWith(partPath, fileData);

    expect(renameSpy).toHaveBeenCalledTimes(1);
    expect(renameSpy).toHaveBeenCalledWith(partPath, finalPath);

    expect(path.get()).toBe(finalPath);
  });

  test("cleanup removes the final file", async () => {
    const unlinkSpy = spyOn(fs, "unlink").mockResolvedValue();

    await adapter.cleanup(filename);

    expect(unlinkSpy).toHaveBeenCalledTimes(1);
    expect(unlinkSpy).toHaveBeenCalledWith(finalPath);
  });

  test("write propagates errors from Bun.write and does not call rename", async () => {
    const fileData = new File([new Uint8Array([1, 2, 3])], "ignored.bin");

    const partPath = tools.FilePathAbsolute.fromPartsSafe(base, filename.withSuffix("-part")).get();

    const writeSpy = spyOn(Bun, "write").mockRejectedValue(new Error("disk full"));
    const renameSpy = spyOn(fs, "rename").mockResolvedValue();

    expect(adapter.write(filename, fileData)).rejects.toThrow("disk full");

    expect(writeSpy).toHaveBeenCalledWith(partPath, fileData);
    expect(renameSpy).not.toHaveBeenCalled();
  });

  test("write propagates errors from fs.rename", async () => {
    const fileData = new File([new Uint8Array([1, 2, 3])], "ignored.bin");

    const writeSpy = spyOn(Bun, "write").mockResolvedValue(3 as any);
    const renameSpy = spyOn(fs, "rename").mockRejectedValue(new Error("permission denied"));

    expect(adapter.write(filename, fileData)).rejects.toThrow("permission denied");

    expect(writeSpy).toHaveBeenCalledWith(partPath, fileData);
    expect(renameSpy).toHaveBeenCalledWith(partPath, finalPath);
  });
});
