import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { GzipNoopAdapter } from "../src/gzip-noop.adapter";

const input = tools.FilePathAbsolute.fromString("/var/uploads/sample.txt");
const output = tools.FilePathAbsolute.fromString("/var/uploads/sample.txt.gz");

const adapter = new GzipNoopAdapter();

describe("GzipNoopAdapter", () => {
  test("absolute to absolute", async () => {
    const result = await adapter.pack({ input, output });

    expect(result).toEqual(output);
  });

  test("relative to relative", async () => {
    const input = tools.FilePathRelative.fromString("fixtures/sample.txt");
    const output = tools.FilePathRelative.fromString("fixtures/sample.txt.gz");

    const result = await adapter.pack({ input, output });

    expect(result).toEqual(output);
  });
});
