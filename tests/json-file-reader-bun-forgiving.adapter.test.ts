import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JsonFileReaderBunForgivingAdapter } from "../src/json-file-reader-bun-forgiving.adapter";
import * as mocks from "./mocks";

const json = { json: async () => ({}) } as any;
const content = {};

const JsonFileReader = new JsonFileReaderBunForgivingAdapter();

describe("JsonFileReaderBunForgivingAdapter", () => {
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
    const bunFile = spyOn(Bun, "file").mockImplementation(() => {
      throw new Error(mocks.IntentionalError);
    });
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await JsonFileReader.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });
});
