import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";

const adapter = new FileRenamerNoopAdapter();

describe("FileRenamerNoopAdapter", () => {
  test("happy path - string", async () => {
    const input = "package.json";
    const output = "package-lock.json";

    expect(async () => adapter.rename(input, output)).not.toThrow();
  });

  test("happy path - relative", async () => {
    const input = tools.FilePathRelative.fromString("users/package.json");
    const output = tools.FilePathRelative.fromString("users/package-lock.json");

    expect(async () => adapter.rename(input, output)).not.toThrow();
  });

  test("happy path - absolute", async () => {
    const input = tools.FilePathAbsolute.fromString("/users/package.json");
    const output = tools.FilePathAbsolute.fromString("/users/package-lock.json");

    expect(async () => adapter.rename(input, output)).not.toThrow();
  });
});
