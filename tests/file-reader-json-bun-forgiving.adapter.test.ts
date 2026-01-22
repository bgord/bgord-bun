import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileReaderJsonBunForgivingAdapter } from "../src/file-reader-json-bun-forgiving.adapter";
import * as mocks from "./mocks";

const content = { version: 1 };
const json = { json: async () => content };

const FileReaderJson = new FileReaderJsonBunForgivingAdapter();

describe("FileReaderJsonBunForgivingAdapter", () => {
  test("happy path - string", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue(json);
    const path = "package.json";

    expect(await FileReaderJson.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path);
  });

  test("happy path - relative", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue(json);
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await FileReaderJson.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - absolute", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue(json);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await FileReaderJson.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - error", async () => {
    const bunFile = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await FileReaderJson.read(path)).toEqual({});
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });
});
