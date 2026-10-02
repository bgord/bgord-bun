import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { AtomicFileWriterNoopAdapter } from "../src/atomic-file-writer-noop.adapter";
import { FileReaderRawNoopAdapter } from "../src/file-reader-raw-noop.adapter";
import { GzipAdapter } from "../src/gzip.adapter";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/var/uploads/sample.txt");
const output = tools.FilePathAbsolute.fromString("/var/uploads/sample.txt.gz");

const content = new TextEncoder().encode("hello world").buffer;
const gzipped = new Uint8Array([31, 139, 8, 0, 0, 0]);

const AtomicFileWriter = new AtomicFileWriterNoopAdapter();
const FileReaderRaw = new FileReaderRawNoopAdapter(content);
const deps = { FileReaderRaw, AtomicFileWriter };

const adapter = new GzipAdapter(deps);

describe("GzipAdapter", () => {
  test("absolute to absolute", async () => {
    using bunGzipSync = spyOn(Bun, "gzipSync").mockReturnValue(gzipped);

    expect(await adapter.pack({ input, output })).toEqual(output);
    expect(bunGzipSync).toHaveBeenCalledWith(content);
  });

  test("relative to relative", async () => {
    using _ = spyOn(Bun, "gzipSync").mockReturnValue(gzipped);
    const input = tools.FilePathRelative.fromString("fixtures/sample.txt");
    const output = tools.FilePathRelative.fromString("fixtures/sample.txt.gz");

    expect(await adapter.pack({ input, output })).toEqual(output);
  });

  test("read error propagation", async () => {
    using _ = spyOn(FileReaderRaw, "read").mockImplementation(mocks.throwIntentionalErrorAsync);
    using bunGzipSync = spyOn(Bun, "gzipSync");

    expect(async () => adapter.pack({ input, output })).toThrow(mocks.IntentionalError);
    expect(bunGzipSync).not.toHaveBeenCalled();
  });

  test("write error propagation", async () => {
    using _bunGzipSync = spyOn(Bun, "gzipSync").mockReturnValue(gzipped);
    using _atomicFileWriterWrite = spyOn(AtomicFileWriter, "write").mockRejectedValue(mocks.IntentionalError);

    expect(async () => adapter.pack({ input, output })).toThrow(mocks.IntentionalError);
  });
});
