import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileHashSha256BunAdapter } from "../src/file-hash-sha256-bun.adapter";

describe("FileHashBunWebCryptoAdapter.hash", () => {
  test("hashes absolute path (sha256 of 'hello') and returns bytes", async () => {
    const fakeFile = { arrayBuffer: async () => new TextEncoder().encode("hello").buffer, lastModified: 0 };
    // @ts-expect-error
    const bunFileSpy = spyOn(Bun, "file").mockImplementation((_p: string) => fakeFile);

    const adapter = new FileHashSha256BunAdapter();
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.txt");

    const result = await adapter.hash(input);

    expect(bunFileSpy).toHaveBeenCalledWith("/var/data/hello.txt");
    expect(result.etag).toEqual("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
    // @ts-expect-error
    expect(result.size.toBytes()).toEqual(5);
    expect(result.lastModified).toEqual(tools.Timestamp.parse(0));
    expect(result.mime.raw).toEqual("text/plain; charset=utf-8");
  });

  test("hashes relative path (sha256 of 'abc') and returns bytes", async () => {
    const fakeFile = { arrayBuffer: async () => new TextEncoder().encode("abc").buffer, lastModified: 0 };
    // @ts-expect-error
    const bunFileSpy = spyOn(Bun, "file").mockImplementation((_p: string) => fakeFile);

    const adapter = new FileHashSha256BunAdapter();
    const input = tools.FilePathRelative.fromString("images/payload.bin");

    const result = await adapter.hash(input);

    expect(bunFileSpy).toHaveBeenCalledWith("images/payload.bin");
    expect(result.etag).toEqual("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    // @ts-expect-error
    expect(result.size.toBytes()).toEqual(3);
    expect(result.lastModified).toEqual(tools.Timestamp.parse(0));
    expect(result.mime.raw).toEqual("application/octet-stream");
  });
});
