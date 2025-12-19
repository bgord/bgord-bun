import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JsonFileReaderNoopAdapter } from "../src/json-file-reader-noop.adapter";

const content = {};

const JsonFileReader = new JsonFileReaderNoopAdapter(content);

describe("JsonFileReaderBunAdapter", () => {
  test("happy path - string", async () => {
    const path = "package.json";

    expect(await JsonFileReader.read(path)).toEqual(content);
  });

  test("happy path - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await JsonFileReader.read(path)).toEqual(content);
  });

  test("happy path - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await JsonFileReader.read(path)).toEqual(content);
  });
});
