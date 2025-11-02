import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileHashSha256BunAdapter } from "../src/file-hash-sha256-bun.adapter";

const adapter = new FileHashSha256BunAdapter();

describe("FileHashSha256BunAdapter", () => {
  test("absolute path", async () => {
    const fakeFile = { arrayBuffer: async () => new TextEncoder().encode("hello").buffer, lastModified: 0 };
    // @ts-expect-error
    const bunFileSpy = spyOn(Bun, "file").mockImplementation(() => fakeFile);

    const input = tools.FilePathAbsolute.fromString("/var/data/hello.pdf");

    const result = await adapter.hash(input);

    expect(bunFileSpy).toHaveBeenCalledWith("/var/data/hello.pdf");
    expect(result.etag).toEqual("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
    // @ts-expect-error
    expect(result.size.toBytes()).toEqual(5);
    expect(result.lastModified).toEqual(tools.Timestamp.fromNumber(0));
    expect(result.mime.toString()).toEqual("application/pdf");
  });

  test("relative path", async () => {
    const fakeFile = { arrayBuffer: async () => new TextEncoder().encode("abc").buffer, lastModified: 0 };
    // @ts-expect-error
    const bunFileSpy = spyOn(Bun, "file").mockImplementation(() => fakeFile);

    const input = tools.FilePathRelative.fromString("images/payload.bin");

    const result = await adapter.hash(input);

    expect(bunFileSpy).toHaveBeenCalledWith("images/payload.bin");
    expect(result.etag).toEqual("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    // @ts-expect-error
    expect(result.size.toBytes()).toEqual(3);
    expect(result.lastModified).toEqual(tools.Timestamp.fromNumber(0));
    expect(result.mime.toString()).toEqual("application/octet-stream");
  });
});
