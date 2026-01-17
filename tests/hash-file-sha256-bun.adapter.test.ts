import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hash } from "../src/hash.vo";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";
import { HashFileSha256BunAdapter } from "../src/hash-file-sha256-bun.adapter";

const jpegMime = tools.Mime.fromString("image/jpeg");
const jpgExtension = tools.Extension.parse("jpg");
const jpegExtension = tools.Extension.parse("jpeg");

const MimeRegistry = new tools.MimeRegistry([{ mime: jpegMime, extensions: [jpgExtension, jpegExtension] }]);

const HashContent = new HashContentSha256BunStrategy();
const deps = { HashContent, MimeRegistry };

const adapter = new HashFileSha256BunAdapter(deps);

describe("HashFileSha256BunAdapter", () => {
  test("absolute path", async () => {
    const text = "hello";
    const file = {
      arrayBuffer: async () => new TextEncoder().encode(text).buffer,
      text: async () => text,
      lastModified: 0,
    } as any;
    const bunFile = spyOn(Bun, "file").mockImplementation(() => file);
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.jpg");

    const result = await adapter.hash(input);

    expect(bunFile).toHaveBeenCalledWith("/var/data/hello.jpg");
    expect(result.etag).toEqual(
      Hash.fromString("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"),
    );
    // @ts-expect-error
    expect(result.size.toBytes()).toEqual(5);
    expect(result.lastModified).toEqual(tools.Timestamp.fromNumber(0));
    expect(result.mime.toString()).toEqual("image/jpeg");
  });

  test("absolute path - mime not found", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.pdf");

    expect(async () => adapter.hash(input)).toThrow(tools.MimeRegistryError.MimeNotFound);
  });

  test("relative path", async () => {
    const text = "abc";
    const file = {
      arrayBuffer: async () => new TextEncoder().encode(text).buffer,
      text: async () => text,
      lastModified: 0,
    } as any;
    const bunFile = spyOn(Bun, "file").mockImplementation(() => file);
    const input = tools.FilePathRelative.fromString("images/payload.jpeg");

    const result = await adapter.hash(input);

    expect(bunFile).toHaveBeenCalledWith("images/payload.jpeg");
    expect(result.etag).toEqual(
      Hash.fromString("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"),
    );
    // @ts-expect-error
    expect(result.size.toBytes()).toEqual(3);
    expect(result.lastModified).toEqual(tools.Timestamp.fromNumber(0));
    expect(result.mime.toString()).toEqual("image/jpeg");
  });

  test("relative path - mime not found", async () => {
    const input = tools.FilePathRelative.fromString("images/payload.pdf");

    expect(async () => adapter.hash(input)).toThrow(tools.MimeRegistryError.MimeNotFound);
  });
});
