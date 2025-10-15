import { describe, expect, jest, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { FileHashNoopAdapter } from "../src/file-hash-noop.adapter";
import { RemoteFileStorageDiskAdapter } from "../src/remote-file-storage-disk.adapter";

const hasher = new FileHashNoopAdapter();
const hash = {
  etag: "etag-123",
  size: tools.Size.fromBytes(42),
  lastModified: tools.Timestamp.parse(1000),
  mime: new tools.Mime("text/plain"),
};

const root = tools.DirectoryPathAbsoluteSchema.parse("/root");
const key = tools.ObjectKey.parse("users/1/avatar.webp");
const adapter = new RemoteFileStorageDiskAdapter({ root, hasher });

describe("RemoteFileStorageDiskAdapter", () => {
  test("putFromPath", async () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockImplementation(() => ({}));
    const bunWriteSpy = spyOn(Bun, "write").mockImplementation(jest.fn());
    const hashSpy = spyOn(hasher, "hash").mockResolvedValue(hash);
    const mkdirSpy = spyOn(fs, "mkdir").mockResolvedValue(undefined);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const input = tools.FilePathAbsolute.fromString("/tmp/upload/avatar.webp");

    const output = await adapter.putFromPath({ key, path: input });

    expect(mkdirSpy).toHaveBeenCalledWith("/root/users/1", { recursive: true });
    expect(bunWriteSpy).toHaveBeenCalledWith("/root/users/1/avatar-part.webp", expect.anything());
    expect(renameSpy).toHaveBeenCalledWith("/root/users/1/avatar-part.webp", "/root/users/1/avatar.webp");
    expect(hashSpy).toHaveBeenCalledTimes(1);

    expect(output.etag).toEqual(hash.etag);
    expect(output.size.toBytes()).toEqual(tools.SizeBytes.parse(42));
  });

  test("head", async () => {
    const hashSpy = spyOn(hasher, "hash")
      .mockResolvedValueOnce(hash)
      .mockRejectedValueOnce(new Error("missing"));

    const success = await adapter.head(key);
    expect(success.exists).toEqual(true);
    // @ts-expect-error
    expect(success.etag).toEqual(hash.etag);

    const error = await adapter.head(key);
    expect(error.exists).toEqual(false);

    expect(hashSpy).toHaveBeenCalledTimes(2);
  });

  test("getStream", async () => {
    const stream = new ReadableStream();

    // @ts-expect-error
    spyOn(Bun, "file").mockImplementation(() => ({ stream: () => stream }));

    expect(await adapter.getStream(key)).toEqual(stream);
  });

  test("delete", async () => {
    const unlinkSpy = spyOn(fs, "unlink").mockImplementation(jest.fn());

    await new RemoteFileStorageDiskAdapter({ root, hasher }).delete(key);

    expect(unlinkSpy).toHaveBeenCalledWith("/root/users/1/avatar.webp");
  });

  test("publicUrl", () => {
    const cdn = new RemoteFileStorageDiskAdapter({
      root,
      hasher,
      publicBaseUrl: "https://cdn.example.com/static",
    });

    expect(cdn.publicUrl(key)).toEqual("https://cdn.example.com/static/users/1/avatar.webp");
    expect(adapter.publicUrl(key)).toEqual("/users/1/avatar.webp");
  });
});
