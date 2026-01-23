import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileReaderRawNoopAdapter } from "../src/file-reader-raw-noop.adapter";
import { GzipAdapter } from "../src/gzip.adapter";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/var/uploads/sample.txt");
const output = tools.FilePathAbsolute.fromString("/var/uploads/sample.txt.gz");

const content = new TextEncoder().encode("hello world").buffer;
const gzipped = new Uint8Array([31, 139, 8, 0, 0, 0]);

const FileReaderRaw = new FileReaderRawNoopAdapter(content);
const deps = { FileReaderRaw };

const adapter = new GzipAdapter(deps);

describe("GzipAdapter", () => {
  test("absolute to absolute", async () => {
    const bunGzipSync = spyOn(Bun, "gzipSync").mockReturnValue(gzipped);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    const result = await adapter.pack({ input, output });

    expect(result).toEqual(output);
    expect(bunGzipSync).toHaveBeenCalledWith(content);
    expect(bunWrite).toHaveBeenCalledWith(output.get(), gzipped);
  });

  test("relative to relative", async () => {
    const input = tools.FilePathRelative.fromString("fixtures/sample.txt");
    const output = tools.FilePathRelative.fromString("fixtures/sample.txt.gz");
    spyOn(Bun, "gzipSync").mockReturnValue(gzipped);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    const result = await adapter.pack({ input, output });

    expect(result).toEqual(output);
    expect(bunWrite).toHaveBeenCalledWith(output.get(), gzipped);
  });

  test("read error propagation", async () => {
    spyOn(FileReaderRaw, "read").mockImplementation(mocks.throwIntentionalErrorAsync);
    const bunGzipSync = spyOn(Bun, "gzipSync");
    const bunWrite = spyOn(Bun, "write");

    expect(adapter.pack({ input, output })).rejects.toThrow(mocks.IntentionalError);
    expect(bunGzipSync).not.toHaveBeenCalled();
    expect(bunWrite).not.toHaveBeenCalled();
  });

  test("write error propagation", async () => {
    spyOn(Bun, "gzipSync").mockReturnValue(gzipped);
    spyOn(Bun, "write").mockRejectedValue(mocks.IntentionalError);

    expect(adapter.pack({ input, output })).rejects.toThrow(mocks.IntentionalError);
  });
});
