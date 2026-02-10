import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileReaderJsonAdapter } from "../src/file-reader-json.adapter";
import * as mocks from "./mocks";

const content = { version: 1 };
const json = { json: async () => content };

const adapter = new FileReaderJsonAdapter();

describe("FileReaderJsonAdapter", () => {
  test("happy path - string", async () => {
    const path = "package.json";
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(json);

    expect(await adapter.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path);
  });

  test("happy path - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.json");
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(json);

    expect(await adapter.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");
    // @ts-expect-error Partial access
    using bunFile = spyOn(Bun, "file").mockReturnValue(json);

    expect(await adapter.read(path)).toEqual(content);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });

  test("happy path - error", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");
    using bunFile = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    expect(async () => adapter.read(path)).toThrow(mocks.IntentionalError);
    expect(bunFile).toHaveBeenCalledWith(path.get());
  });
});
