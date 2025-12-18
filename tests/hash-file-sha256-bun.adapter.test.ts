import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hash } from "../src/hash.vo";
import { HashContentSha256BunAdapter } from "../src/hash-content-sha256-bun.adapter";
import { HashFileSha256BunAdapter } from "../src/hash-file-sha256-bun.adapter";

const HashContent = new HashContentSha256BunAdapter();
const deps = { HashContent };
const adapter = new HashFileSha256BunAdapter(deps);

describe("HashFileSha256BunAdapter", () => {
  test("absolute path", async () => {
    const text = "hello";
    const fakeFile = {
      arrayBuffer: async () => new TextEncoder().encode(text).buffer,
      text: async () => text,
      lastModified: 0,
    };
    // @ts-expect-error
    const bunFile = spyOn(Bun, "file").mockImplementation(() => fakeFile);
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.pdf");

    const result = await adapter.hash(input);

    expect(bunFile).toHaveBeenCalledWith("/var/data/hello.pdf");
    expect(result.etag).toEqual(
      Hash.fromString("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"),
    );
    // @ts-expect-error
    expect(result.size.toBytes()).toEqual(5);
    expect(result.lastModified).toEqual(tools.Timestamp.fromNumber(0));
    expect(result.mime.toString()).toEqual("application/pdf");
  });

  test("relative path", async () => {
    const text = "abc";
    const fakeFile = {
      arrayBuffer: async () => new TextEncoder().encode(text).buffer,
      text: async () => text,
      lastModified: 0,
    };
    // @ts-expect-error
    const bunFile = spyOn(Bun, "file").mockImplementation(() => fakeFile);
    const input = tools.FilePathRelative.fromString("images/payload.bin");

    const result = await adapter.hash(input);

    expect(bunFile).toHaveBeenCalledWith("images/payload.bin");
    expect(result.etag).toEqual(
      Hash.fromString("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"),
    );
    // @ts-expect-error
    expect(result.size.toBytes()).toEqual(3);
    expect(result.lastModified).toEqual(tools.Timestamp.fromNumber(0));
    expect(result.mime.toString()).toEqual("application/octet-stream");
  });
});
