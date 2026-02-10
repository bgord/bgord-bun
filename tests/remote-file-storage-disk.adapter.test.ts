import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { DirectoryEnsurerNoopAdapter } from "../src/directory-ensurer-noop.adapter";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { FileCopierNoopAdapter } from "../src/file-copier-noop.adapter";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { HashFileNoopAdapter } from "../src/hash-file-noop.adapter";
import { RemoteFileStorageDiskAdapter } from "../src/remote-file-storage-disk.adapter";
import * as mocks from "./mocks";

const hash = {
  etag: mocks.hash,
  size: tools.Size.fromBytes(42),
  lastModified: tools.Timestamp.fromNumber(1000),
  mime: tools.Mimes.text.mime,
};
const root = tools.DirectoryPathAbsoluteSchema.parse("/root");
const key = tools.ObjectKey.parse("users/1/avatar.webp");

const HashFile = new HashFileNoopAdapter();
const FileCleaner = new FileCleanerNoopAdapter();
const FileRenamer = new FileRenamerNoopAdapter();
const FileCopier = new FileCopierNoopAdapter();
const DirectoryEnsurer = new DirectoryEnsurerNoopAdapter();
const deps = { HashFile, FileCleaner, FileRenamer, FileCopier, DirectoryEnsurer };

const adapter = new RemoteFileStorageDiskAdapter({ root }, deps);

describe("RemoteFileStorageDiskAdapter", () => {
  test("putFromPath", async () => {
    using fileCopierCopy = spyOn(FileCopier, "copy");
    using fileHashHash = spyOn(HashFile, "hash").mockResolvedValue(hash);
    using directoryEnsurerEnsure = spyOn(DirectoryEnsurer, "ensure");
    using fileRenamerRename = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/tmp/upload/avatar.webp");
    const temporary = tools.FilePathAbsolute.fromString("/root/users/1/avatar-part.webp");
    const final = tools.FilePathAbsolute.fromString("/root/users/1/avatar.webp");

    const output = await adapter.putFromPath({ key, path: input });

    expect(directoryEnsurerEnsure).toHaveBeenCalledWith("/root/users/1");
    expect(fileCopierCopy).toHaveBeenCalledWith(input, temporary);
    expect(fileRenamerRename).toHaveBeenCalledWith(temporary, final);
    expect(fileHashHash).toHaveBeenCalledTimes(1);
    expect(output.etag).toEqual(hash.etag);
    expect(output.size.toBytes()).toEqual(tools.SizeBytes.parse(42));
  });

  test("head", async () => {
    using fileHashHash = spyOn(HashFile, "hash")
      .mockResolvedValueOnce(hash)
      .mockRejectedValueOnce(mocks.IntentionalError);

    const success = await adapter.head(key);

    // @ts-expect-error Partial access
    expect(success.etag).toEqual(hash.etag);
    expect(success.exists).toEqual(true);

    const error = await adapter.head(key);

    expect(error.exists).toEqual(false);
    expect(fileHashHash).toHaveBeenCalledTimes(2);
  });

  test("getStream", async () => {
    const stream = new ReadableStream();
    // @ts-expect-error TODO
    using _ = spyOn(Bun, "file").mockImplementation(() => ({ stream: () => stream }));

    expect(await adapter.getStream(key)).toEqual(stream);
  });

  test("getStream - null", async () => {
    using _ = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    const result = await adapter.getStream(key);

    expect(result).toEqual(null);
  });

  test("delete", async () => {
    using fileCleanerDelete = spyOn(FileCleaner, "delete");

    await adapter.delete(key);

    expect(fileCleanerDelete).toHaveBeenCalledWith(
      tools.FilePathAbsolute.fromString("/root/users/1/avatar.webp"),
    );
  });

  test("delete - cleaner failure", async () => {
    using _ = spyOn(FileCleaner, "delete").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => await adapter.delete(key)).toThrow(mocks.IntentionalError);
  });

  test("get root", () => {
    expect(adapter.root).toEqual(root);
  });
});
