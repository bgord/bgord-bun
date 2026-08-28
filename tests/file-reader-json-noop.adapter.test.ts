import { describe, expect, test } from "bun:test";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import * as testcases from "./testcases";

const content = {};

const adapter = new FileReaderJsonNoopAdapter(content);

describe("FileReaderJsonNoopAdapter", () => {
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
