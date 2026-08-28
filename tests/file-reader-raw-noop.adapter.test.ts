import { describe, expect, test } from "bun:test";
import { FileReaderRawNoopAdapter } from "../src/file-reader-raw-noop.adapter";
import * as testcases from "./testcases";

const content = new TextEncoder().encode("hello").buffer;
const adapter = new FileReaderRawNoopAdapter(content);

describe("FileReaderRawNoopAdapter", () => {
  test("happy path - string", async () => {
    expect(await adapter.read(testcases.file.input.string)).toEqual(content);
  });

  test("happy path - relative", async () => {
    expect(await adapter.read(testcases.file.input.relative)).toEqual(content);
  });

  test("happy path - absolute", async () => {
    expect(await adapter.read(testcases.file.input.absolute)).toEqual(content);
  });
});
