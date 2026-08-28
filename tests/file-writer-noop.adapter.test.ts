import { describe, expect, test } from "bun:test";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";
import * as testcases from "./testcases";

const adapter = new FileWriterNoopAdapter();

describe("FileWriterNoopAdapter", () => {
  test("happy path - string", async () => {
    const content = "data";

    expect(async () => adapter.write(testcases.file.input.string, content)).not.toThrow();
  });

  test("happy path - relative", async () => {
    const content = new Uint8Array([1, 2, 3]);

    expect(async () => adapter.write(testcases.file.input.relative, content)).not.toThrow();
  });

  test("happy path - absolute", async () => {
    const content = new ArrayBuffer(8);

    expect(async () => adapter.write(testcases.file.input.absolute, content)).not.toThrow();
  });
});
