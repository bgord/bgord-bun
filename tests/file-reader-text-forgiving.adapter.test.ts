import { describe, expect, spyOn, test } from "bun:test";
import { FileReaderTextForgivingAdapter } from "../src/file-reader-text-forgiving.adapter";
import * as mocks from "./mocks";
import * as testcases from "./testcases";

const content = "abc";
const text = { text: async () => content };

const adapter = new FileReaderTextForgivingAdapter();

describe("FileReaderTextForgivingAdapter", () => {
  test("happy path - string", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(text);

    expect(await adapter.read(testcases.file.input.string)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(testcases.file.input.string);
  });

  test("happy path - relative", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(text);

    expect(await adapter.read(testcases.file.input.relative)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(testcases.file.input.relative.get());
  });

  test("happy path - absolute", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(text);

    expect(await adapter.read(testcases.file.input.absolute)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(testcases.file.input.absolute.get());
  });

  test("happy path - error", async () => {
    using bunFile = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    expect(await adapter.read(testcases.file.input.absolute)).toEqual("");
    expect(bunFile).toHaveBeenCalledWith(testcases.file.input.absolute.get());
  });

  test("happy path - error - custom fallback", async () => {
    using bunFile = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);
    const adapter = new FileReaderTextForgivingAdapter("unknown");

    expect(await adapter.read(testcases.file.input.absolute)).toEqual("unknown");
    expect(bunFile).toHaveBeenCalledWith(testcases.file.input.absolute.get());
  });
});
