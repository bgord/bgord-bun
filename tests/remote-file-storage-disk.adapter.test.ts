import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { FileHashNoopAdapter } from "../src/file-hash-noop.adapter";
import { RemoteFileStorageDiskAdapter } from "../src/remote-file-storage-disk.adapter";

const hasher = new FileHashNoopAdapter();

describe("RemoteFileStorageDiskAdapter", () => {
  test("putFromPath: writes -part, renames atomically, returns hasher result", async () => {
    const hashSpy = spyOn(hasher, "hash").mockResolvedValue({
      etag: "etag-123",
      size: tools.Size.fromBytes(42),
      lastModified: tools.Timestamp.parse(1000),
      mime: new tools.Mime("text/plain"),
    });

    const adapter = new RemoteFileStorageDiskAdapter({
      root: tools.DirectoryPathAbsoluteSchema.parse("/var/storage"),
      hasher,
    });

    const mkdirSpy = spyOn(fs, "mkdir").mockResolvedValue(undefined);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    // @ts-expect-error
    spyOn(Bun, "file").mockImplementation((p: string) => {
      expect(p).toBe("/tmp/upload/avatar.webp");
      return {};
    });
    const bunWriteSpy = spyOn(Bun, "write").mockResolvedValue(undefined as any);

    const key = tools.ObjectKey.parse("users/u-1/avatar.webp");
    const input = tools.FilePathAbsolute.fromString("/tmp/upload/avatar.webp");

    const out = await adapter.putFromPath({ key, path: input });

    expect(mkdirSpy).toHaveBeenCalledWith("/var/storage/users/u-1", { recursive: true });
    expect(bunWriteSpy).toHaveBeenCalledWith("/var/storage/users/u-1/avatar-part.webp", expect.anything());
    expect(renameSpy).toHaveBeenCalledWith(
      "/var/storage/users/u-1/avatar-part.webp",
      "/var/storage/users/u-1/avatar.webp",
    );
    expect(hashSpy).toHaveBeenCalledTimes(1);
    expect(out.etag).toBe("etag-123");
    // @ts-expect-error
    expect(out.size.toBytes()).toBe(42);
  });

  test("head: exists=true uses hasher; exists=false on hash error", async () => {
    const hasher = new FileHashNoopAdapter();

    const hashSpy = spyOn(hasher, "hash")
      .mockResolvedValueOnce({
        etag: "abc",
        size: tools.Size.fromBytes(7),
        lastModified: tools.Timestamp.parse(1000),
        mime: new tools.Mime("text/plain"),
      })
      .mockRejectedValueOnce(new Error("missing"));

    const adapter = new RemoteFileStorageDiskAdapter({
      root: tools.DirectoryPathAbsoluteSchema.parse("/data"),
      hasher,
    });

    const ok = await adapter.head(tools.ObjectKey.parse("users/a/avatar.webp"));
    expect(ok.exists).toBe(true);
    // @ts-expect-error
    expect(ok.etag).toBe("abc");

    const miss = await adapter.head(tools.ObjectKey.parse("users/b/avatar.webp"));
    expect(miss.exists).toBe(false);

    expect(hashSpy).toHaveBeenCalledTimes(2);
  });

  test("getStream: returns Bun.file(...).stream()", async () => {
    const adapter = new RemoteFileStorageDiskAdapter({
      root: tools.DirectoryPathAbsoluteSchema.parse("/srv/store"),
      hasher,
    });

    const stream = new ReadableStream();
    // @ts-expect-error
    spyOn(Bun, "file").mockImplementation((path: string) => {
      expect(path).toBe("/srv/store/users/u/avatar.webp");
      return { stream: () => stream };
    });

    expect(await adapter.getStream(tools.ObjectKey.parse("users/u/avatar.webp"))).toBe(stream);
  });

  test("delete: best-effort unlink", async () => {
    const adapter = new RemoteFileStorageDiskAdapter({
      root: tools.DirectoryPathAbsoluteSchema.parse("/opt/storage"),
      hasher,
    });

    const unlinkSpy = spyOn(fs, "unlink").mockResolvedValue(undefined);

    await adapter.delete(tools.ObjectKey.parse("users/z/avatar.webp"));
    expect(unlinkSpy).toHaveBeenCalledWith("/opt/storage/users/z/avatar.webp");
  });

  test("publicUrl: with and without base", () => {
    const key = tools.ObjectKey.parse("users/u/avatar.webp");

    const cdn = new RemoteFileStorageDiskAdapter({
      root: tools.DirectoryPathAbsoluteSchema.parse("/any"),
      hasher,
      publicBaseUrl: "https://cdn.example.com/static",
    });

    expect(cdn.publicUrl(key)).toBe("https://cdn.example.com/static/users/u/avatar.webp");

    const normal = new RemoteFileStorageDiskAdapter({
      root: tools.DirectoryPathAbsoluteSchema.parse("/any"),
      hasher,
    });
    expect(normal.publicUrl(key)).toBe("/users/u/avatar.webp");
  });
});
