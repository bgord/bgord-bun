import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { DirectoryEnsurerAdapter } from "../src/directory-ensurer.adapter";
import * as mocks from "./mocks";

const adapter = new DirectoryEnsurerAdapter();

describe("DirectoryEnsurerAdapter", () => {
  test("happy path - relative", async () => {
    using fsMkdir = spyOn(fs, "mkdir").mockResolvedValue(undefined);
    const path = tools.DirectoryPathRelativeSchema.parse("users/uploads");

    await adapter.ensure(path);

    expect(fsMkdir).toHaveBeenCalledWith(path, { recursive: true });
  });

  test("happy path - absolute", async () => {
    using fsMkdir = spyOn(fs, "mkdir").mockResolvedValue(undefined);
    const path = tools.DirectoryPathAbsoluteSchema.parse("/users/uploads");

    await adapter.ensure(path);

    expect(fsMkdir).toHaveBeenCalledWith(path, { recursive: true });
  });

  test("throw an error", () => {
    using _ = spyOn(fs, "mkdir").mockImplementation(mocks.throwIntentionalError);
    const path = tools.DirectoryPathAbsoluteSchema.parse("/users/uploads");

    expect(async () => adapter.ensure(path)).toThrow(mocks.IntentionalError);
  });
});
