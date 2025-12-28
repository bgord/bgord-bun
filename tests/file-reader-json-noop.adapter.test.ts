import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";

const content = {};

const adapter = new FileReaderJsonNoopAdapter(content);

describe("FileReaderJsonNoopAdapter", () => {
  test("happy path - string", async () => {
    const path = "package.json";

    expect(await adapter.read(path)).toEqual(content);
  });

  test("happy path - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.read(path)).toEqual(content);
  });

  test("happy path - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.read(path)).toEqual(content);
  });
});
