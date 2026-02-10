import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileReaderJsonForgivingAdapter } from "../src/file-reader-json-forgiving.adapter";
import * as mocks from "./mocks";

const content = { version: 1 };
const json = { json: async () => content };

const FileReaderJson = new FileReaderJsonForgivingAdapter();

describe("FileReaderJsonForgivingAdapter", () => {
  test("happy path - string", async () => {
    const path = "package.json";
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(json);

    expect(await FileReaderJson.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path);
  });

  test("happy path - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.json");
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(json);

    expect(await FileReaderJson.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(json);

    expect(await FileReaderJson.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - error", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");
    using bunFile = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    expect(await FileReaderJson.read(path)).toEqual({});
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });
});
