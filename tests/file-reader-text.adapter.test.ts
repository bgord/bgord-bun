import { describe, expect, spyOn, test } from "bun:test";
import { FileReaderTextAdapter } from "../src/file-reader-text.adapter";
import * as mocks from "./mocks";
import * as testcases from "./testcases";

const content = "abc";
const text = { text: async () => content };

const adapter = new FileReaderTextAdapter();

describe("FileReaderTextAdapter", () => {
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

    expect(async () => adapter.read(testcases.file.input.absolute)).toThrow(mocks.IntentionalError);
    expect(bunFile).toHaveBeenCalledWith(testcases.file.input.absolute.get());
  });
});
