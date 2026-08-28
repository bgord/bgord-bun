import { describe, expect, test } from "bun:test";
import { FileReaderTextNoopAdapter } from "../src/file-reader-text-noop.adapter";
import * as testcases from "./testcases";

const content = "abc";
const adapter = new FileReaderTextNoopAdapter(content);

describe("FileReaderTextNoopAdapter", () => {
  test("happy path - string", async () => {
    expect(await adapter.read(testcases.file.input.string)).toEqual(content);
  });

  test("happy path - relative", async () => {
    expect(await adapter.read(testcases.file.input.relative)).toEqual(content);
  });

  test("happy path - absolute", async () => {
    expect(await adapter.read(testcases.file.input.absolute)).toEqual(content);
  });

  test("default text", async () => {
    const adapter = new FileReaderTextNoopAdapter();

    expect(await adapter.read(testcases.file.input.string)).toEqual("");
  });
});
