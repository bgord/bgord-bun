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

  test("canRead - string", async () => {
    const path = "package.json";

    expect(await adapter.canRead(path)).toEqual(true);
  });

  test("canRead - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.canRead(path)).toEqual(true);
  });

  test("canRead - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.canRead(path)).toEqual(true);
  });

  test("canWrite - string", async () => {
    const path = "package.json";

    expect(await adapter.canWrite(path)).toEqual(true);
  });

  test("canWrite - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.canWrite(path)).toEqual(true);
  });

  test("canWrite - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.canWrite(path)).toEqual(true);
  });

  test("canExecute - string", async () => {
    const path = "package.json";

    expect(await adapter.canExecute(path)).toEqual(true);
  });

  test("canExecute - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.canExecute(path)).toEqual(true);
  });

  test("canExecute - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.canExecute(path)).toEqual(true);
  });

  test("isDirectory - relative", async () => {
    const path = tools.DirectoryPathRelativeSchema.parse("users");

    expect(await adapter.isDirectory(path)).toEqual(true);
  });

  test("isDirectory - absolute", async () => {
    const path = tools.DirectoryPathAbsoluteSchema.parse("/users");

    expect(await adapter.isDirectory(path)).toEqual(true);
  });
});
