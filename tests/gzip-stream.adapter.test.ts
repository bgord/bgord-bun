import { describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs";
import { PassThrough } from "node:stream";
import * as zlib from "node:zlib";
import * as tools from "@bgord/tools";
import { GzipStreamAdapter } from "../src/gzip-stream.adapter";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/virtual/input.txt");
const output = tools.FilePathAbsolute.fromString("/virtual/output.txt.gz");
const payload = new TextEncoder().encode("hello world");

const adapter = new GzipStreamAdapter();

describe("GzipStreamAdapter", () => {
  test("absolute to absolute", async () => {
    const source = new PassThrough();
    const gzip = new PassThrough();
    const sink = new PassThrough();
    const chunks: Uint8Array[] = [];
    sink.on("data", (c) => chunks.push(c));
    const fsCreateReadStream = spyOn(fs, "createReadStream").mockReturnValue(source as any);
    const zlibCreateGzip = spyOn(zlib, "createGzip").mockReturnValue(gzip as any);
    const fsCreateWriteStream = spyOn(fs, "createWriteStream").mockReturnValue(sink as any);
    source.end(payload);

    const result = await adapter.pack({ input, output });

    expect(result).toEqual(output);
    expect(fsCreateReadStream).toHaveBeenCalledWith(input.get());
    expect(zlibCreateGzip).toHaveBeenCalledTimes(1);
    expect(fsCreateWriteStream).toHaveBeenCalledWith(output.get());
  });

  test("relative to relative", async () => {
    const input = tools.FilePathRelative.fromString("fixtures/in.txt");
    const output = tools.FilePathRelative.fromString("fixtures/in.txt.gz");
    const source = new PassThrough();
    const gzip = new PassThrough();
    const sink = new PassThrough();
    const fsCreateReadStream = spyOn(fs, "createReadStream").mockReturnValue(source as any);
    const fsCreateWriteStream = spyOn(fs, "createWriteStream").mockReturnValue(sink as any);
    spyOn(zlib, "createGzip").mockReturnValue(gzip as any);
    source.end(payload);

    const result = await adapter.pack({ input: input, output: output });

    expect(result).toEqual(output);
    expect(fsCreateReadStream).toHaveBeenCalledWith(input.get());
    expect(fsCreateWriteStream).toHaveBeenCalledWith(output.get());
  });

  test("error propagation", async () => {
    spyOn(fs, "createReadStream").mockImplementation(() => {
      throw mocks.IntentialError;
    });
    const zlibCreateGzip = spyOn(zlib, "createGzip");
    const fsCreateWriteStream = spyOn(fs, "createWriteStream");

    expect(adapter.pack({ input, output })).rejects.toThrow(mocks.IntentialError);
    expect(zlibCreateGzip).not.toHaveBeenCalled();
    expect(fsCreateWriteStream).not.toHaveBeenCalled();
  });
});
