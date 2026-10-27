import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";
import { Hash } from "../src/hash.vo";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { HashFileMetadataAdapter } from "../src/hash-file-metadata.adapter";
import * as mocks from "./mocks";

const jpegMime = tools.Mime.fromString("image/jpeg");
const jpgExtension = v.parse(tools.Extension, "jpg");
const jpegExtension = v.parse(tools.Extension, "jpeg");

const size = tools.Size.fromKb(1);
const lastModified = mocks.TIME_ZERO;
const FileInspection = new FileInspectionNoopAdapter({ exists: true, size, lastModified });
const MimeRegistry = new tools.MimeRegistry([
  new tools.MimeRegistryEntry(jpegMime, jpgExtension, [jpegExtension]),
]);

const HashContent = new HashContentSha256Strategy();
const deps = { HashContent, FileInspection, MimeRegistry };

const adapter = new HashFileMetadataAdapter(deps);

describe("HashFileMetadataAdapter", () => {
  test("absolute path", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.jpg");

    const result = await adapter.hash(input);

    expect(result.etag).toEqual(
      Hash.fromString("bce56de5605ea88e38c7bba845c9067ae2cb2f5e6bcb2d94c0251135d531792c"),
    );
    expect(result.size).toEqual(size);
    expect(result.lastModified).toEqual(lastModified);
    expect(result.mime.toString()).toEqual("image/jpeg");
  });

  test("relative path", async () => {
    const input = tools.FilePathRelative.fromString("images/payload.jpeg");

    const result = await adapter.hash(input);

    expect(result.etag).toEqual(
      Hash.fromString("bce56de5605ea88e38c7bba845c9067ae2cb2f5e6bcb2d94c0251135d531792c"),
    );
    expect(result.size).toEqual(size);
    expect(result.lastModified).toEqual(lastModified);
    expect(result.mime.toString()).toEqual("image/jpeg");
  });

  test("different size", async () => {
    const FileInspection = new FileInspectionNoopAdapter({
      exists: true,
      size: tools.Size.fromKb(2),
      lastModified,
    });
    const adapter = new HashFileMetadataAdapter({ ...deps, FileInspection });
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.jpg");

    const result = await adapter.hash(input);

    expect(result.etag).toEqual(
      Hash.fromString("d4839b88fa6041bbdb4871a98f973fdfcaba40b14faf10e6d0f25173145ca6d6"),
    );
  });

  test("mime not found", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.pdf");

    expect(async () => adapter.hash(input)).toThrow(tools.MimeRegistryError.MimeNotFound);
  });

  test("size error", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: true, size, lastModified });
    using _ = spyOn(FileInspection, "size").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new HashFileMetadataAdapter({ ...deps, FileInspection });
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.jpg");

    expect(async () => adapter.hash(input)).toThrow(mocks.IntentionalError);
  });

  test("last modified error", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: true, size, lastModified });
    using _ = spyOn(FileInspection, "lastModified").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new HashFileMetadataAdapter({ ...deps, FileInspection });
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.jpg");

    expect(async () => adapter.hash(input)).toThrow(mocks.IntentionalError);
  });
});
