import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { DirectoryEnsurerAdapter } from "../src/directory-ensurer.adapter";
import * as mocks from "./mocks";

const adapter = new DirectoryEnsurerAdapter();

describe("DirectoryEnsurerAdapter", () => {
  test("happy path - relative", async () => {
    using fsMkdir = spyOn(fs, "mkdir").mockResolvedValue(undefined);
    const path = v.parse(tools.DirectoryPathRelativeSchema, "users/uploads");

    await adapter.ensure(path);

    expect(fsMkdir).toHaveBeenCalledWith(path, { recursive: true });
  });

  test("happy path - absolute", async () => {
    using fsMkdir = spyOn(fs, "mkdir").mockResolvedValue(undefined);
    const path = v.parse(tools.DirectoryPathAbsoluteSchema, "/users/uploads");

    await adapter.ensure(path);

    expect(fsMkdir).toHaveBeenCalledWith(path, { recursive: true });
  });

  test("throw an error", () => {
    const path = v.parse(tools.DirectoryPathAbsoluteSchema, "/users/uploads");
    using _ = spyOn(fs, "mkdir").mockImplementation(mocks.throwIntentionalError);

    expect(async () => adapter.ensure(path)).toThrow(mocks.IntentionalError);
  });
});
