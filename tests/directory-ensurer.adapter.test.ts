import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import { DirectoryEnsurerAdapter } from "../src/directory-ensurer.adapter";
import * as mocks from "./mocks";

const adapter = new DirectoryEnsurerAdapter();

describe("DirectoryEnsurerAdapter", () => {
  test("happy path - relative", async () => {
    const path = tools.DirectoryPathRelativeSchema.parse("users/uploads");
    using fsMkdir = spyOn(fs, "mkdir").mockResolvedValue(undefined);

    await adapter.ensure(path);

    expect(fsMkdir).toHaveBeenCalledWith(path, { recursive: true });
  });

  test("happy path - absolute", async () => {
    const path = tools.DirectoryPathAbsoluteSchema.parse("/users/uploads");
    using fsMkdir = spyOn(fs, "mkdir").mockResolvedValue(undefined);

    await adapter.ensure(path);

    expect(fsMkdir).toHaveBeenCalledWith(path, { recursive: true });
  });

  test("throw an error", () => {
    const path = tools.DirectoryPathAbsoluteSchema.parse("/users/uploads");
    using _ = spyOn(fs, "mkdir").mockImplementation(mocks.throwIntentionalError);

    expect(async () => adapter.ensure(path)).toThrow(mocks.IntentionalError);
  });
});
