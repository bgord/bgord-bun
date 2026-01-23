import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { DirectoryEnsurerNoopAdapter } from "../src/directory-ensurer-noop.adapter";

const adapter = new DirectoryEnsurerNoopAdapter();

describe("DirectoryEnsurerNoopAdapter", () => {
  test("happy path - relative", async () => {
    const path = tools.DirectoryPathRelativeSchema.parse("users/uploads");

    expect(async () => adapter.ensure(path)).not.toThrow();
  });

  test("happy path - absolute", async () => {
    const path = tools.DirectoryPathAbsoluteSchema.parse("/users/uploads");

    expect(async () => adapter.ensure(path)).not.toThrow();
  });
});
