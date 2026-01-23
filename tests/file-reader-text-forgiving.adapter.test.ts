import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileReaderTextForgivingAdapter } from "../src/file-reader-text-forgiving.adapter";
import * as mocks from "./mocks";

const content = "abc";
const text = { text: async () => content };

const adapter = new FileReaderTextForgivingAdapter();

describe("FileReaderTextForgivingAdapter", () => {
  test("happy path - string", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue(text);
    const path = "package.txt";

    expect(await adapter.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path);
  });

  test("happy path - relative", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue(text);
    const path = tools.FilePathRelative.fromString("users/package.txt");

    expect(await adapter.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - absolute", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue(text);
    const path = tools.FilePathAbsolute.fromString("/users/package.txt");

    expect(await adapter.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - error", async () => {
    const bunFile = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);
    const path = tools.FilePathAbsolute.fromString("/users/package.txt");

    expect(await adapter.read(path)).toEqual("");
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - error - custom fallback", async () => {
    const bunFile = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);
    const path = tools.FilePathAbsolute.fromString("/users/package.txt");
    const adapter = new FileReaderTextForgivingAdapter("unknown");

    expect(await adapter.read(path)).toEqual("unknown");
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });
});
