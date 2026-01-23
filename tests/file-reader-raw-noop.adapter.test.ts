import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileReaderRawNoopAdapter } from "../src/file-reader-raw-noop.adapter";

const content = new TextEncoder().encode("hello").buffer;
const adapter = new FileReaderRawNoopAdapter(content);

describe("FileReaderRawNoopAdapter", () => {
  test("happy path - string", async () => {
    const path = "package.txt";

    expect(await adapter.read(path)).toEqual(content);
  });

  test("happy path - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.txt");

    expect(await adapter.read(path)).toEqual(content);
  });

  test("happy path - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.txt");

    expect(await adapter.read(path)).toEqual(content);
  });
});
