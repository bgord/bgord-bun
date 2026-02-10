import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileReaderTextAdapter } from "../src/file-reader-text.adapter";
import * as mocks from "./mocks";

const content = "abc";
const text = { text: async () => content };

const adapter = new FileReaderTextAdapter();

describe("FileReaderTextAdapter", () => {
  test("happy path - string", async () => {
    const path = "package.txt";
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(text);

    expect(await adapter.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path);
  });

  test("happy path - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.txt");
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(text);

    expect(await adapter.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.txt");
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(text);

    expect(await adapter.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - error", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.txt");
    using bunFile = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    expect(async () => adapter.read(path)).toThrow(mocks.IntentionalError);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });
});
