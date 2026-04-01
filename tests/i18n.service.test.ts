import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { FileReaderJsonForgivingAdapter } from "../src/file-reader-json-forgiving.adapter";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { I18n } from "../src/i18n.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const FileReaderJson = new FileReaderJsonNoopAdapter({ hello: "Hello" });
const deps = { Logger, FileReaderJson };
const i18n = new I18n(deps);

const translations = { greeting: "Hello", welcome: "Welcome, {{name}}!" };

const t = i18n.useTranslations(translations);

describe("I18n", () => {
  test("getTranslationPathForLanguage", () => {
    expect(i18n.getTranslationPathForLanguage(mocks.languages.supported.en).get()).toEqual(
      `infra/translations/${mocks.languages.supported.en}.json`,
    );
  });

  test("getTranslationPathForLanguage - custom path", () => {
    expect(
      new I18n(deps, v.parse(tools.DirectoryPathRelativeSchema, "custom/path"))
        .getTranslationPathForLanguage(mocks.languages.supported.pl)
        .get(),
    ).toEqual(`custom/path/${mocks.languages.supported.pl}.json`);
  });

  test("useTranslations", () => {
    expect(t("greeting")).toEqual("Hello");
  });

  test("useTranslations - placeholder", () => {
    expect(t("welcome", { name: "John" })).toEqual("Welcome, John!");
  });

  test("useTranslations - passthrough", () => {
    using loggerWarn = spyOn(Logger, "warn");
    const key = "nonexistent";

    expect(t(key)).toEqual(key);
    expect(loggerWarn).toHaveBeenCalledWith({
      message: "Missing translation key",
      component: "infra",
      operation: "translations",
      metadata: { key },
    });
  });

  test("getTranslations", async () => {
    expect(await i18n.getTranslations(mocks.languages.supported.en)).toEqual({ hello: "Hello" });
  });

  test("getTranslations - error", async () => {
    using _ = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    const i18n = new I18n({ FileReaderJson: new FileReaderJsonForgivingAdapter(), Logger });

    expect(await i18n.getTranslations(mocks.languages.supported.en)).toEqual({});
  });
});
