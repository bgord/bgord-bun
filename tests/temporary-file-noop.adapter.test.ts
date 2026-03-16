import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { TemporaryFileNoopAdapter } from "../src/temporary-file-noop.adapter";

const directory = v.parse(tools.DirectoryPathAbsoluteSchema, "/tmp/bgord-tests");
const filename = tools.Filename.fromString("avatar.webp");
const final = tools.FilePathAbsolute.fromPartsSafe(directory, filename);

const adapter = new TemporaryFileNoopAdapter(directory);

describe("TemporaryFileAbsoluteAdapter", () => {
  test("write", async () => {
    expect(await adapter.write(filename)).toEqual(final);
  });

  test("cleanup", async () => {
    expect(async () => adapter.cleanup()).not.toThrow();
  });

  test("get root", () => {
    expect(adapter.root).toEqual(directory);
  });
});
