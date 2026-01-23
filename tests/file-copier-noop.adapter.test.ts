import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileCopierNoopAdapter } from "../src/file-copier-noop.adapter";

const adapter = new FileCopierNoopAdapter();

describe("FileCopierNoopAdapter", () => {
  test("happy path - string", async () => {
    const path = "package.json";

    expect(async () => adapter.copy(path, path)).not.toThrow();
  });

  test("happy path - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(async () => adapter.copy(path, path)).not.toThrow();
  });

  test("happy path - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(async () => adapter.copy(path, path)).not.toThrow();
  });
});
