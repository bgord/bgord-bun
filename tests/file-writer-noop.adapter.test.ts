import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";

const adapter = new FileWriterNoopAdapter();

describe("FileWriterNoopAdapter", () => {
  test("happy path - string", async () => {
    const path = "package.json";
    const content = "data";

    expect(async () => adapter.write(path, content)).not.toThrow();
  });

  test("happy path - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.json");
    const content = new Uint8Array([1, 2, 3]);

    expect(async () => adapter.write(path, content)).not.toThrow();
  });

  test("happy path - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");
    const content = new ArrayBuffer(8);

    expect(async () => adapter.write(path, content)).not.toThrow();
  });
});
