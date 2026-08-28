import { describe, expect, spyOn, test } from "bun:test";
import { FileReaderJsonForgivingAdapter } from "../src/file-reader-json-forgiving.adapter";
import * as mocks from "./mocks";
import * as testcases from "./testcases";

const content = { version: 1 };
const json = { json: async () => content };

const FileReaderJson = new FileReaderJsonForgivingAdapter();

describe("FileReaderJsonForgivingAdapter", () => {
  test("happy path - string", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(json);

    expect(await FileReaderJson.read(testcases.file.input.string)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(testcases.file.input.string);
  });

  test("happy path - relative", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(json);

    expect(await FileReaderJson.read(testcases.file.input.relative)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(testcases.file.input.relative.get());
  });

  test("happy path - absolute", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(json);

    expect(await FileReaderJson.read(testcases.file.input.absolute)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(testcases.file.input.absolute.get());
  });

  test("happy path - error", async () => {
    using bunFile = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    expect(await FileReaderJson.read(testcases.file.input.absolute)).toEqual({});
    expect(bunFile).toHaveBeenCalledWith(testcases.file.input.absolute.get());
  });

  test("happy path - malformed json", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue({ json: mocks.throwIntentionalErrorAsync });

    expect(await FileReaderJson.read(testcases.file.input.absolute)).toEqual({});
    expect(bunFile).toHaveBeenCalledWith(testcases.file.input.absolute.get());
  });
});
