import { describe, expect, spyOn, test } from "bun:test";
import { FileReaderJsonForgivingAdapter } from "../src/file-reader-json-forgiving.adapter";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { I18n } from "../src/i18n.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const FileReaderJson = new FileReaderJsonNoopAdapter({ hello: "Hello" });
const deps = { Logger, FileReaderJson };
const i18n = new I18n(deps);

describe("I18n", () => {
  test("getTranslations", async () => {
    expect(await i18n.getTranslations(mocks.languages.supported.en)).toEqual({ hello: "Hello" });
  });

  test("getTranslations - error", async () => {
    using _ = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    const i18n = new I18n({ FileReaderJson: new FileReaderJsonForgivingAdapter(), Logger });

    expect(await i18n.getTranslations(mocks.languages.supported.en)).toEqual({});
  });
});
