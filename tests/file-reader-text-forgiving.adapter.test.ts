import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileReaderTextForgivingAdapter } from "../src/file-reader-text-forgiving.adapter";
import * as mocks from "./mocks";

const content = "abc";
const text = { text: async () => content };

const adapter = new FileReaderTextForgivingAdapter();

describe("FileReaderTextForgivingAdapter", () => {
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

    expect(await adapter.read(path)).toEqual("");
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - error - custom fallback", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.txt");
    const adapter = new FileReaderTextForgivingAdapter("unknown");
    using bunFile = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    expect(await adapter.read(path)).toEqual("unknown");
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });
});
