import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { GzipBunAdapter } from "../src/gzip-bun.adapter";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/var/uploads/sample.txt");
const output = tools.FilePathAbsolute.fromString("/var/uploads/sample.txt.gz");

const adapter = new GzipBunAdapter();

const file = new TextEncoder().encode("hello world").buffer;
const gzipped = new Uint8Array([31, 139, 8, 0, 0, 0]);

describe("GzipBunAdapter", () => {
  test("absolute to absolute", async () => {
    const bunFileSpy = spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => file } as any);
    const gzipSpy = spyOn(Bun, "gzipSync").mockReturnValue(gzipped);
    const writeSpy = spyOn(Bun, "write").mockResolvedValue(0);

    const result = await adapter.pack({ input, output });

    expect(result).toEqual(output);
    expect(bunFileSpy).toHaveBeenCalledWith(input.get());
    expect(gzipSpy).toHaveBeenCalledWith(file);
    expect(writeSpy).toHaveBeenCalledWith(output.get(), gzipped);
  });

  test("relative to relative", async () => {
    const input = tools.FilePathRelative.fromString("fixtures/sample.txt");
    const output = tools.FilePathRelative.fromString("fixtures/sample.txt.gz");

    spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => file } as any);
    spyOn(Bun, "gzipSync").mockReturnValue(gzipped);
    const writeSpy = spyOn(Bun, "write").mockResolvedValue(0);

    const result = await adapter.pack({ input, output });

    expect(result).toEqual(output);
    expect(writeSpy).toHaveBeenCalledWith(output.get(), gzipped);
  });

  test("read error propagation", async () => {
    spyOn(Bun, "file").mockReturnValue({
      arrayBuffer: async () => {
        throw mocks.IntentialError;
      },
    } as any);
    const bunGzipSyncSpy = spyOn(Bun, "gzipSync");
    const bunWriteSpy = spyOn(Bun, "write");

    expect(adapter.pack({ input, output })).rejects.toThrow(mocks.IntentialError);
    expect(bunGzipSyncSpy).not.toHaveBeenCalled();
    expect(bunWriteSpy).not.toHaveBeenCalled();
  });

  test("write error propagation", async () => {
    spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => file } as any);
    spyOn(Bun, "gzipSync").mockReturnValue(gzipped);
    spyOn(Bun, "write").mockRejectedValue(mocks.IntentialError);

    expect(adapter.pack({ input, output })).rejects.toThrow(mocks.IntentialError);
  });
});
