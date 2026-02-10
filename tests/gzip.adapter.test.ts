import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileReaderRawNoopAdapter } from "../src/file-reader-raw-noop.adapter";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";
import { GzipAdapter } from "../src/gzip.adapter";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/var/uploads/sample.txt");
const output = tools.FilePathAbsolute.fromString("/var/uploads/sample.txt.gz");

const content = new TextEncoder().encode("hello world").buffer;
const gzipped = new Uint8Array([31, 139, 8, 0, 0, 0]);

const FileWriter = new FileWriterNoopAdapter();
const FileReaderRaw = new FileReaderRawNoopAdapter(content);
const deps = { FileReaderRaw, FileWriter };

const adapter = new GzipAdapter(deps);

describe("GzipAdapter", () => {
  test("absolute to absolute", async () => {
    using bunGzipSync = spyOn(Bun, "gzipSync").mockReturnValue(gzipped);

    expect(await adapter.pack({ input, output })).toEqual(output);
    expect(bunGzipSync).toHaveBeenCalledWith(content);
  });

  test("relative to relative", async () => {
    const input = tools.FilePathRelative.fromString("fixtures/sample.txt");
    const output = tools.FilePathRelative.fromString("fixtures/sample.txt.gz");
    using _ = spyOn(Bun, "gzipSync").mockReturnValue(gzipped);

    expect(await adapter.pack({ input, output })).toEqual(output);
  });

  test("read error propagation", async () => {
    using _ = spyOn(FileReaderRaw, "read").mockImplementation(mocks.throwIntentionalErrorAsync);
    using bunGzipSync = spyOn(Bun, "gzipSync");

    expect(adapter.pack({ input, output })).rejects.toThrow(mocks.IntentionalError);
    expect(bunGzipSync).not.toHaveBeenCalled();
  });

  test("write error propagation", async () => {
    using _ = spyOn(Bun, "gzipSync").mockReturnValue(gzipped);
    using __ = spyOn(FileWriter, "write").mockRejectedValue(mocks.IntentionalError);

    expect(adapter.pack({ input, output })).rejects.toThrow(mocks.IntentionalError);
  });
});
