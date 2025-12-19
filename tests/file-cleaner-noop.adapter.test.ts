import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";

const adapter = new FileCleanerNoopAdapter();

describe("FileCleanerNoopAdapter", () => {
  test("happy path - string", async () => {
    const path = "package.json";

    expect(async () => adapter.delete(path)).not.toThrow();
  });

  test("happy path - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(async () => adapter.delete(path)).not.toThrow();
  });

  test("happy path - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(async () => adapter.delete(path)).not.toThrow();
  });
});
