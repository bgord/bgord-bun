import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import * as testcases from "./testcases";

const adapter = new FileRenamerNoopAdapter();

describe("FileRenamerNoopAdapter", () => {
  test("happy path - string", async () => {
    const output = "package-lock.json";

    expect(async () => adapter.rename(testcases.file.input.string, output)).not.toThrow();
  });

  test("happy path - relative", async () => {
    const output = tools.FilePathRelative.fromString("users/package-lock.json");

    expect(async () => adapter.rename(testcases.file.input.relative, output)).not.toThrow();
  });

  test("happy path - absolute", async () => {
    const output = tools.FilePathAbsolute.fromString("/users/package-lock.json");

    expect(async () => adapter.rename(testcases.file.input.absolute, output)).not.toThrow();
  });
});
