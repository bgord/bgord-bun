import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JsonFileReaderBunForgivingAdapter } from "../src/json-file-reader-bun-forgiving.adapter";
import * as mocks from "./mocks";

const JsonFileReader = new JsonFileReaderBunForgivingAdapter();

const json = { json: async () => ({}) } as any;
const content = {};

describe("JsonFileReaderBunForgivingAdapter", () => {
  test("happy path - string", async () => {
    const bunFileSpy = spyOn(Bun, "file").mockReturnValue(json);

    const path = "package.json";

    expect(await JsonFileReader.read(path)).toEqual(content);
    expect(bunFileSpy).toHaveBeenCalledWith(path);
  });

  test("happy path - relative", async () => {
    const bunFileSpy = spyOn(Bun, "file").mockReturnValue(json);

    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await JsonFileReader.read(path)).toEqual(content);
    expect(bunFileSpy).toHaveBeenCalledWith(path.get());
  });

  test("happy path - absolute", async () => {
    const bunFileSpy = spyOn(Bun, "file").mockReturnValue(json);

    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await JsonFileReader.read(path)).toEqual(content);
    expect(bunFileSpy).toHaveBeenCalledWith(path.get());
  });

  test("happy path - error", async () => {
    const bunFileSpy = spyOn(Bun, "file").mockImplementation(() => {
      throw new Error(mocks.IntentialError);
    });

    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await JsonFileReader.read(path)).toEqual(content);
    expect(bunFileSpy).toHaveBeenCalledWith(path.get());
  });
});
