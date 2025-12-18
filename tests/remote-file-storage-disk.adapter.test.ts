import { describe, expect, jest, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { HashFileNoopAdapter } from "../src/hash-file-noop.adapter";
import { RemoteFileStorageDiskAdapter } from "../src/remote-file-storage-disk.adapter";
import * as mocks from "./mocks";

const hash = {
  etag: mocks.hash,
  size: tools.Size.fromBytes(42),
  lastModified: tools.Timestamp.fromNumber(1000),
  mime: tools.MIMES.text,
};
const root = tools.DirectoryPathAbsoluteSchema.parse("/root");
const key = tools.ObjectKey.parse("users/1/avatar.webp");

const HashFile = new HashFileNoopAdapter();
const FileCleaner = new FileCleanerNoopAdapter();
const FileRenamer = new FileRenamerNoopAdapter();
const deps = { HashFile, FileCleaner, FileRenamer };
const adapter = new RemoteFileStorageDiskAdapter({ root }, deps);

describe("RemoteFileStorageDiskAdapter", () => {
  test("putFromPath", async () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockImplementation(() => ({}));
    const bunWrite = spyOn(Bun, "write").mockImplementation(jest.fn());
    const fileHashHash = spyOn(HashFile, "hash").mockResolvedValue(hash);
    const fsMkdir = spyOn(fs, "mkdir").mockResolvedValue(undefined);
    const fileRenamerRename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/tmp/upload/avatar.webp");
    const temporary = tools.FilePathAbsolute.fromString("/root/users/1/avatar-part.webp");

    const output = await adapter.putFromPath({ key, path: input });

    expect(fsMkdir).toHaveBeenCalledWith("/root/users/1", { recursive: true });
    expect(bunWrite).toHaveBeenCalledWith(temporary.get(), expect.anything());
    expect(fileRenamerRename).toHaveBeenCalledWith(
      temporary,
      tools.FilePathAbsolute.fromString("/root/users/1/avatar.webp"),
    );
    expect(fileHashHash).toHaveBeenCalledTimes(1);
    expect(output.etag).toEqual(hash.etag);
    expect(output.size.toBytes()).toEqual(tools.SizeBytes.parse(42));
  });

  test("head", async () => {
    const fileHashHash = spyOn(HashFile, "hash")
      .mockResolvedValueOnce(hash)
      .mockRejectedValueOnce(new Error("missing"));

    const success = await adapter.head(key);

    // @ts-expect-error
    expect(success.etag).toEqual(hash.etag);
    expect(success.exists).toEqual(true);

    const error = await adapter.head(key);

    expect(error.exists).toEqual(false);
    expect(fileHashHash).toHaveBeenCalledTimes(2);
  });

  test("getStream", async () => {
    const stream = new ReadableStream();
    // @ts-expect-error
    spyOn(Bun, "file").mockImplementation(() => ({ stream: () => stream }));

    expect(await adapter.getStream(key)).toEqual(stream);
  });

  test("delete", async () => {
    const fileCleanerDelete = spyOn(FileCleaner, "delete");

    await adapter.delete(key);

    // @ts-expect-error
    expect(fileCleanerDelete.mock.calls[0][0].get()).toEqual("/root/users/1/avatar.webp");
  });

  test("get root", () => {
    expect(adapter.root).toEqual(root);
  });
});
