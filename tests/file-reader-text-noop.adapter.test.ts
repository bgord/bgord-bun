import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileReaderTextNoopAdapter } from "../src/file-reader-text-noop.adapter";

const content = "abc";
const adapter = new FileReaderTextNoopAdapter(content);

describe("FileReaderTextNoopAdapter", () => {
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
