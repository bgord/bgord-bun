import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { TranslationsProviderJsonAdapter } from "../src/translations-provider-json.adapter";
import * as mocks from "./mocks";

const language = "en";
const filename = tools.Filename.fromParts(language, "json");
const translations = { dog: "dog" };

describe("TranslationsProviderJsonAdapter", () => {
  test("happy path - default path", async () => {
    const FileReaderJson = new FileReaderJsonNoopAdapter(translations);
    const adapter = new TranslationsProviderJsonAdapter({ FileReaderJson });
    using read = spyOn(FileReaderJson, "read");

    expect(await adapter.getTranslationsFor(language)).toEqual(translations);
    expect(read).toHaveBeenCalledWith(
      tools.FilePathRelative.fromParts(TranslationsProviderJsonAdapter.DEFAULT_PATH, filename),
    );
  });

  test("happy path - custom path", async () => {
    const path = "provider/translations";
    const FileReaderJson = new FileReaderJsonNoopAdapter(translations);
    const adapter = new TranslationsProviderJsonAdapter(
      { FileReaderJson },
      { path: v.parse(tools.DirectoryPathRelativeSchema, "provider/translations") },
    );
    using read = spyOn(FileReaderJson, "read");

    expect(await adapter.getTranslationsFor(language)).toEqual(translations);
    expect(read).toHaveBeenCalledWith(tools.FilePathRelative.fromParts(path, filename));
  });

  test("happy path - empty translations", async () => {
    const FileReaderJson = new FileReaderJsonNoopAdapter({});
    const adapter = new TranslationsProviderJsonAdapter({ FileReaderJson });

    expect(await adapter.getTranslationsFor(language)).toEqual({});
  });

  test("error - file reader json", async () => {
    const FileReaderJson = new FileReaderJsonNoopAdapter(translations);
    const adapter = new TranslationsProviderJsonAdapter({ FileReaderJson });
    using _ = spyOn(FileReaderJson, "read").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(await adapter.getTranslationsFor(language)).toEqual({});
  });
});
