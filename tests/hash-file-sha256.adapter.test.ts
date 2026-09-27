import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";
import { FileReaderRawNoopAdapter } from "../src/file-reader-raw-noop.adapter";
import { Hash } from "../src/hash.vo";
import { HashBytesSha256Strategy } from "../src/hash-bytes-sha256.strategy";
import { HashFileSha256Adapter } from "../src/hash-file-sha256.adapter";
import * as mocks from "./mocks";

const jpegMime = tools.Mime.fromString("image/jpeg");
const jpgExtension = v.parse(tools.Extension, "jpg");
const jpegExtension = v.parse(tools.Extension, "jpeg");

const size = tools.Size.fromKb(1);
const lastModified = mocks.TIME_ZERO;
const FileInspection = new FileInspectionNoopAdapter({ exists: true, size, lastModified });
const MimeRegistry = new tools.MimeRegistry([{ mime: jpegMime, extensions: [jpgExtension, jpegExtension] }]);

const HashBytes = new HashBytesSha256Strategy();
const deps = { HashBytes, FileInspection, MimeRegistry };

const raw = (content: string) => new TextEncoder().encode(content).buffer as ArrayBuffer;

describe("HashFileSha256Adapter", () => {
  test("absolute path", async () => {
    const FileReaderRaw = new FileReaderRawNoopAdapter(raw("hello"));
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.jpg");
    const adapter = new HashFileSha256Adapter({ FileReaderRaw, ...deps });

    const result = await adapter.hash(input);

    expect(result.etag).toEqual(
      Hash.fromString("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"),
    );
    expect(result.size).toEqual(size);
    expect(result.lastModified).toEqual(lastModified);
    expect(result.mime.toString()).toEqual("image/jpeg");
  });

  test("absolute path - mime not found", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.pdf");
    const FileReaderRaw = new FileReaderRawNoopAdapter(raw("hello"));
    const adapter = new HashFileSha256Adapter({ FileReaderRaw, ...deps });

    expect(async () => adapter.hash(input)).toThrow(tools.MimeRegistryError.MimeNotFound);
  });

  test("absolute path - size error", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: true, size });
    using _ = spyOn(FileInspection, "size").mockImplementation(mocks.throwIntentionalErrorAsync);
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.jpg");
    const FileReaderRaw = new FileReaderRawNoopAdapter(raw("hello"));
    const adapter = new HashFileSha256Adapter({ ...deps, FileReaderRaw, FileInspection });

    expect(async () => adapter.hash(input)).toThrow(mocks.IntentionalError);
  });

  test("absolute path - last modified error", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: true, size });
    using _ = spyOn(FileInspection, "lastModified").mockImplementation(mocks.throwIntentionalErrorAsync);
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.jpg");
    const FileReaderRaw = new FileReaderRawNoopAdapter(raw("hello"));
    const adapter = new HashFileSha256Adapter({ ...deps, FileReaderRaw, FileInspection });

    expect(async () => adapter.hash(input)).toThrow(mocks.IntentionalError);
  });

  test("absolute path - read error", async () => {
    const FileReaderRaw = new FileReaderRawNoopAdapter(raw("hello"));
    using _ = spyOn(FileReaderRaw, "read").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new HashFileSha256Adapter({ FileReaderRaw, ...deps });
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.jpg");

    expect(async () => adapter.hash(input)).toThrow(mocks.IntentionalError);
  });

  test("relative path", async () => {
    const FileReaderRaw = new FileReaderRawNoopAdapter(raw("abc"));
    const input = tools.FilePathRelative.fromString("images/payload.jpeg");
    const adapter = new HashFileSha256Adapter({ FileReaderRaw, ...deps });

    const result = await adapter.hash(input);

    expect(result.etag).toEqual(
      Hash.fromString("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"),
    );
    expect(result.size).toEqual(size);
    expect(result.lastModified).toEqual(lastModified);
    expect(result.mime.toString()).toEqual("image/jpeg");
  });

  test("relative path - mime not found", async () => {
    const input = tools.FilePathRelative.fromString("images/payload.pdf");
    const FileReaderRaw = new FileReaderRawNoopAdapter(raw("abc"));
    const adapter = new HashFileSha256Adapter({ FileReaderRaw, ...deps });

    expect(async () => adapter.hash(input)).toThrow(tools.MimeRegistryError.MimeNotFound);
  });

  test("relative path - size error", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: true, size });
    using _ = spyOn(FileInspection, "size").mockImplementation(mocks.throwIntentionalErrorAsync);
    const input = tools.FilePathRelative.fromString("images/payload.jpg");
    const FileReaderRaw = new FileReaderRawNoopAdapter(raw("abc"));
    const adapter = new HashFileSha256Adapter({ ...deps, FileReaderRaw, FileInspection });

    expect(async () => adapter.hash(input)).toThrow(mocks.IntentionalError);
  });

  test("relative path - size error", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: true, size });
    using _ = spyOn(FileInspection, "lastModified").mockImplementation(mocks.throwIntentionalErrorAsync);
    const input = tools.FilePathRelative.fromString("images/payload.jpg");
    const FileReaderRaw = new FileReaderRawNoopAdapter(raw("abc"));
    const adapter = new HashFileSha256Adapter({ ...deps, FileReaderRaw, FileInspection });

    expect(async () => adapter.hash(input)).toThrow(mocks.IntentionalError);
  });

  test("relative path - read error", async () => {
    const FileReaderRaw = new FileReaderRawNoopAdapter(raw("abc"));
    using _ = spyOn(FileReaderRaw, "read").mockImplementation(mocks.throwIntentionalErrorAsync);
    const input = tools.FilePathRelative.fromString("images/payload.jpeg");
    const adapter = new HashFileSha256Adapter({ FileReaderRaw, ...deps });

    expect(async () => adapter.hash(input)).toThrow(mocks.IntentionalError);
  });

  test("absolute path - distinct binary content, distinct etags", async () => {
    const first = new FileReaderRawNoopAdapter(new Uint8Array([0xff, 0x41]).buffer as ArrayBuffer);
    const second = new FileReaderRawNoopAdapter(new Uint8Array([0xfe, 0x41]).buffer as ArrayBuffer);
    const input = tools.FilePathAbsolute.fromString("/var/data/payload.jpg");
    const firstAdapter = new HashFileSha256Adapter({ FileReaderRaw: first, ...deps });
    const secondAdapter = new HashFileSha256Adapter({ FileReaderRaw: second, ...deps });

    const resultFirst = await firstAdapter.hash(input);
    const resultSecond = await secondAdapter.hash(input);

    expect(resultFirst.etag.matches(resultSecond.etag)).toEqual(false);
  });
});
