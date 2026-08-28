import { describe, expect, test } from "bun:test";
import { FileCopierNoopAdapter } from "../src/file-copier-noop.adapter";
import * as testcases from "./testcases";

const adapter = new FileCopierNoopAdapter();

describe("FileCopierNoopAdapter", () => {
  test("happy path - string", async () => {
    expect(async () => adapter.copy(testcases.file.input.string, testcases.file.input.string)).not.toThrow();
  });

  test("happy path - relative", async () => {
    expect(async () =>
      adapter.copy(testcases.file.input.relative, testcases.file.input.relative),
    ).not.toThrow();
  });

  test("happy path - absolute", async () => {
    expect(async () =>
      adapter.copy(testcases.file.input.absolute, testcases.file.input.absolute),
    ).not.toThrow();
  });
});
