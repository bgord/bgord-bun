import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";

const adapter = new FileInspectionNoopAdapter({ exists: true });

describe("FileInspectionNoopAdapter", () => {
  test("exists - string", async () => {
    const path = "package.json";

    expect(await adapter.exists(path)).toEqual(true);
  });

  test("exist - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.exists(path)).toEqual(true);
  });

  test("exist - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.exists(path)).toEqual(true);
  });
});
