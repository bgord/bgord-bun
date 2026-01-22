import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { GzipAdapter } from "../src/gzip.adapter";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/var/uploads/sample.txt");
const output = tools.FilePathAbsolute.fromString("/var/uploads/sample.txt.gz");
const file = new TextEncoder().encode("hello world").buffer;
const gzipped = new Uint8Array([31, 139, 8, 0, 0, 0]);

const adapter = new GzipAdapter();

describe("GzipAdapter", () => {
  test("absolute to absolute", async () => {
    // @ts-expect-error TODO
    const bunFile = spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => file });
    const bunGzipSync = spyOn(Bun, "gzipSync").mockReturnValue(gzipped);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    const result = await adapter.pack({ input, output });

    expect(result).toEqual(output);
    expect(bunFile).toHaveBeenCalledWith(input.get());
    expect(bunGzipSync).toHaveBeenCalledWith(file);
    expect(bunWrite).toHaveBeenCalledWith(output.get(), gzipped);
  });

  test("relative to relative", async () => {
    const input = tools.FilePathRelative.fromString("fixtures/sample.txt");
    const output = tools.FilePathRelative.fromString("fixtures/sample.txt.gz");
    // @ts-expect-error TODO
    spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => file });
    spyOn(Bun, "gzipSync").mockReturnValue(gzipped);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    const result = await adapter.pack({ input, output });

    expect(result).toEqual(output);
    expect(bunWrite).toHaveBeenCalledWith(output.get(), gzipped);
  });

  test("read error propagation", async () => {
    // @ts-expect-error TODO
    spyOn(Bun, "file").mockReturnValue({ arrayBuffer: mocks.throwIntentionalErrorAsync });
    const bunGzipSync = spyOn(Bun, "gzipSync");
    const bunWrite = spyOn(Bun, "write");

    expect(adapter.pack({ input, output })).rejects.toThrow(mocks.IntentionalError);
    expect(bunGzipSync).not.toHaveBeenCalled();
    expect(bunWrite).not.toHaveBeenCalled();
  });

  test("write error propagation", async () => {
    // @ts-expect-error TODO
    spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => file });
    spyOn(Bun, "gzipSync").mockReturnValue(gzipped);
    spyOn(Bun, "write").mockRejectedValue(mocks.IntentionalError);

    expect(adapter.pack({ input, output })).rejects.toThrow(mocks.IntentionalError);
  });
});
