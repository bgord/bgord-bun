import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hash } from "../src/hash.vo";
import { HashFileNoopAdapter } from "../src/hash-file-noop.adapter";

const adapter = new HashFileNoopAdapter();

describe("HashContentNoopAdapter", () => {
  test("absolute path", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/data/hello.pdf");

    const result = await adapter.hash(input);

    expect(result.etag).toEqual(
      Hash.fromString("0000000000000000000000000000000000000000000000000000000000000000"),
    );
    // @ts-expect-error
    expect(result.size.toBytes()).toEqual(10);
    expect(result.lastModified).toEqual(tools.Timestamp.fromNumber(1000));
    expect(result.mime.toString()).toEqual("text/plain");
  });

  test("relative path", async () => {
    const input = tools.FilePathRelative.fromString("images/payload.bin");

    const result = await adapter.hash(input);

    expect(result.etag).toEqual(
      Hash.fromString("0000000000000000000000000000000000000000000000000000000000000000"),
    );
    // @ts-expect-error
    expect(result.size.toBytes()).toEqual(10);
    expect(result.lastModified).toEqual(tools.Timestamp.fromNumber(1000));
    expect(result.mime.toString()).toEqual("text/plain");
  });
});
