import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";

const string = "package.json";
const relative = tools.FilePathRelative.fromString("users/package.json");
const absolute = tools.FilePathAbsolute.fromString("/users/package.json");

const adapter = new FileInspectionNoopAdapter({ exists: true });

describe("FileInspectionNoopAdapter", () => {
  test("exists - string", async () => {
    expect(await adapter.exists(string)).toEqual(true);
  });

  test("exist - relative", async () => {
    expect(await adapter.exists(relative)).toEqual(true);
  });

  test("exist - absolute", async () => {
    expect(await adapter.exists(absolute)).toEqual(true);
  });

  test("canRead - string", async () => {
    expect(await adapter.canRead(string)).toEqual(true);
  });

  test("canRead - relative", async () => {
    expect(await adapter.canRead(relative)).toEqual(true);
  });

  test("canRead - absolute", async () => {
    expect(await adapter.canRead(absolute)).toEqual(true);
  });

  test("canWrite - string", async () => {
    expect(await adapter.canWrite(string)).toEqual(true);
  });

  test("canWrite - relative", async () => {
    expect(await adapter.canWrite(relative)).toEqual(true);
  });

  test("canWrite - absolute", async () => {
    expect(await adapter.canWrite(absolute)).toEqual(true);
  });

  test("canExecute - string", async () => {
    expect(await adapter.canExecute(string)).toEqual(true);
  });

  test("canExecute - relative", async () => {
    expect(await adapter.canExecute(relative)).toEqual(true);
  });

  test("canExecute - absolute", async () => {
    expect(await adapter.canExecute(absolute)).toEqual(true);
  });

  test("isDirectory - relative", async () => {
    const relative = tools.DirectoryPathRelativeSchema.parse("users");

    expect(await adapter.isDirectory(relative)).toEqual(true);
  });

  test("isDirectory - absolute", async () => {
    const absolute = tools.DirectoryPathAbsoluteSchema.parse("/users");

    expect(await adapter.isDirectory(absolute)).toEqual(true);
  });

  test("size - string", async () => {
    expect(await adapter.size(string)).toEqual(tools.Size.fromMB(1));
  });

  test("size - relative", async () => {
    expect(await adapter.size(relative)).toEqual(tools.Size.fromMB(1));
  });

  test("size - absolute", async () => {
    expect(await adapter.size(absolute)).toEqual(tools.Size.fromMB(1));
  });

  test("lastModified - string", async () => {
    expect(await adapter.lastModified(string)).toEqual(tools.Timestamp.fromNumber(0));
  });

  test("lastModified - relative", async () => {
    expect(await adapter.lastModified(relative)).toEqual(tools.Timestamp.fromNumber(0));
  });

  test("lastModified - absolute", async () => {
    expect(await adapter.lastModified(absolute)).toEqual(tools.Timestamp.fromNumber(0));
  });
});
