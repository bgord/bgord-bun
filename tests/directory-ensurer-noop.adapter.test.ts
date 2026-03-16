import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { DirectoryEnsurerNoopAdapter } from "../src/directory-ensurer-noop.adapter";

const adapter = new DirectoryEnsurerNoopAdapter();

describe("DirectoryEnsurerNoopAdapter", () => {
  test("happy path - relative", async () => {
    const path = v.parse(tools.DirectoryPathRelativeSchema, "users/uploads");

    expect(async () => adapter.ensure(path)).not.toThrow();
  });

  test("happy path - absolute", async () => {
    const path = v.parse(tools.DirectoryPathAbsoluteSchema, "/users/uploads");

    expect(async () => adapter.ensure(path)).not.toThrow();
  });
});
