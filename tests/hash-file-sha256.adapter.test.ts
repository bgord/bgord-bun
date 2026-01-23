import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";
import { FileReaderTextNoopAdapter } from "../src/file-reader-text-noop.adapter";
import { Hash } from "../src/hash.vo";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { HashFileSha256Adapter } from "../src/hash-file-sha256.adapter";
import * as mocks from "./mocks";

const jpegMime = tools.Mime.fromString("image/jpeg");
const jpgExtension = tools.Extension.parse("jpg");
const jpegExtension = tools.Extension.parse("jpeg");

const size = tools.Size.fromKb(1);
const FileInspection = new FileInspectionNoopAdapter({ exists: true, size });
const MimeRegistry = new tools.MimeRegistry([{ mime: jpegMime, extensions: [jpgExtension, jpegExtension] }]);

const HashContent = new HashContentSha256Strategy();
const deps = { HashContent, FileInspection, MimeRegistry };

describe("HashFileSha256Adapter", () => {
  test("absolute path", async () => {
    const text = "hello";
    const FileReaderText = new FileReaderTextNoopAdapter(text);
    // @ts-expect-error TODO
    const bunFile = spyOn(Bun, "file").mockImplementation(() => ({ lastModified: 0 }));
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.jpg");
    const adapter = new HashFileSha256Adapter({ FileReaderText, ...deps });

    const result = await adapter.hash(input);

    expect(bunFile).toHaveBeenCalledWith("/var/data/hello.jpg");
    expect(result.etag).toEqual(
      Hash.fromString("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"),
    );
    expect(result.size).toEqual(size);
    expect(result.lastModified).toEqual(tools.Timestamp.fromNumber(0));
    expect(result.mime.toString()).toEqual("image/jpeg");
  });

  test("absolute path - mime not found", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.pdf");
    const FileReaderText = new FileReaderTextNoopAdapter();
    const adapter = new HashFileSha256Adapter({ FileReaderText, ...deps });

    expect(async () => adapter.hash(input)).toThrow(tools.MimeRegistryError.MimeNotFound);
  });

  test("absolute path - size error", async () => {
    const FileReaderText = new FileReaderTextNoopAdapter();
    const FileInspection = new FileInspectionNoopAdapter({ exists: true, size });
    // @ts-expect-error TODO
    spyOn(Bun, "file").mockImplementation(() => ({ lastModified: 0 }));
    spyOn(FileInspection, "size").mockImplementation(mocks.throwIntentionalErrorAsync);
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.jpg");
    const adapter = new HashFileSha256Adapter({ ...deps, FileReaderText, FileInspection });

    expect(async () => adapter.hash(input)).toThrow(mocks.IntentionalError);
  });

  test("absolute path - read error", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.jpg");
    const FileReaderText = new FileReaderTextNoopAdapter();
    const adapter = new HashFileSha256Adapter({ FileReaderText, ...deps });
    spyOn(FileReaderText, "read").mockImplementation(mocks.throwIntentionalErrorAsync);
    // @ts-expect-error TODO
    const bunFile = spyOn(Bun, "file").mockImplementation(() => ({ lastModified: 0 }));

    expect(async () => adapter.hash(input)).toThrow(mocks.IntentionalError);
  });

  test("relative path", async () => {
    const text = "abc";
    const FileReaderText = new FileReaderTextNoopAdapter(text);
    // @ts-expect-error TODO
    const bunFile = spyOn(Bun, "file").mockImplementation(() => ({ lastModified: 0 }));
    const input = tools.FilePathRelative.fromString("images/payload.jpeg");
    const adapter = new HashFileSha256Adapter({ FileReaderText, ...deps });

    const result = await adapter.hash(input);

    expect(bunFile).toHaveBeenCalledWith("images/payload.jpeg");
    expect(result.etag).toEqual(
      Hash.fromString("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"),
    );
    expect(result.size).toEqual(size);
    expect(result.lastModified).toEqual(tools.Timestamp.fromNumber(0));
    expect(result.mime.toString()).toEqual("image/jpeg");
  });

  test("relative path - mime not found", async () => {
    const input = tools.FilePathRelative.fromString("images/payload.pdf");
    const FileReaderText = new FileReaderTextNoopAdapter();
    const adapter = new HashFileSha256Adapter({ FileReaderText, ...deps });

    expect(async () => adapter.hash(input)).toThrow(tools.MimeRegistryError.MimeNotFound);
  });

  test("relative path - size error", async () => {
    const FileReaderText = new FileReaderTextNoopAdapter();
    const FileInspection = new FileInspectionNoopAdapter({ exists: true, size });
    // @ts-expect-error TODO
    spyOn(Bun, "file").mockImplementation(() => ({ lastModified: 0 }));
    spyOn(FileInspection, "size").mockImplementation(mocks.throwIntentionalErrorAsync);
    const input = tools.FilePathRelative.fromString("images/payload.jpg");
    const adapter = new HashFileSha256Adapter({ ...deps, FileReaderText, FileInspection });

    expect(async () => adapter.hash(input)).toThrow(mocks.IntentionalError);
  });

  test("relative path - read error", async () => {
    const input = tools.FilePathRelative.fromString("images/payload.jpeg");
    const FileReaderText = new FileReaderTextNoopAdapter();
    const adapter = new HashFileSha256Adapter({ FileReaderText, ...deps });
    spyOn(FileReaderText, "read").mockImplementation(mocks.throwIntentionalErrorAsync);
    // @ts-expect-error TODO
    const bunFile = spyOn(Bun, "file").mockImplementation(() => ({ lastModified: 0 }));

    expect(async () => adapter.hash(input)).toThrow(mocks.IntentionalError);
  });
});
