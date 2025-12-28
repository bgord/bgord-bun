import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JsonFileReaderBunAdapter } from "../src/file-reader-json-bun.adapter";
import * as mocks from "./mocks";

const json = { json: async () => ({}) } as any;
const content = {};

const JsonFileReader = new JsonFileReaderBunAdapter();

describe("JsonFileReaderBunAdapter", () => {
  test("happy path - string", async () => {
    const bunFile = spyOn(Bun, "file").mockReturnValue(json);
    const path = "package.json";

    expect(await JsonFileReader.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path);
  });

  test("happy path - relative", async () => {
    const bunFile = spyOn(Bun, "file").mockReturnValue(json);
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await JsonFileReader.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - absolute", async () => {
    const bunFile = spyOn(Bun, "file").mockReturnValue(json);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await JsonFileReader.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - error", async () => {
    const bunFile = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(async () => JsonFileReader.read(path)).toThrow(mocks.IntentionalError);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });
});
