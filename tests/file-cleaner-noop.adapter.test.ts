import { describe, expect, test } from "bun:test";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import * as testcases from "./testcases";

const adapter = new FileCleanerNoopAdapter();

describe("FileCleanerNoopAdapter", () => {
  test("happy path - string", async () => {
    expect(async () => adapter.delete(testcases.file.input.string)).not.toThrow();
  });

  test("happy path - relative", async () => {
    expect(async () => adapter.delete(testcases.file.input.relative)).not.toThrow();
  });

  test("happy path - absolute", async () => {
    expect(async () => adapter.delete(testcases.file.input.absolute)).not.toThrow();
  });
});
