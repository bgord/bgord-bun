import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileReaderRawForgivingAdapter } from "../src/file-reader-raw-forgiving.adapter";
import * as mocks from "./mocks";

const content = new TextEncoder().encode("hello").buffer;
const fallback = new TextEncoder().encode("fallback").buffer;
const arrayBuffer = { arrayBuffer: async () => content };

const adapter = new FileReaderRawForgivingAdapter(fallback);

describe("FileReaderRawForgivingAdapter", () => {
  test("happy path - string", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(arrayBuffer);
    const path = "package.txt";

    expect(await adapter.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path);
  });

  test("happy path - relative", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(arrayBuffer);
    const path = tools.FilePathRelative.fromString("users/package.txt");

    expect(await adapter.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - absolute", async () => {
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(arrayBuffer);
    const path = tools.FilePathAbsolute.fromString("/users/package.txt");

    expect(await adapter.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - error", async () => {
    using bunFile = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);
    const path = tools.FilePathAbsolute.fromString("/users/package.txt");

    expect(await adapter.read(path)).toEqual(fallback);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });
});
