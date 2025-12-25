import { describe, expect, jest, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";
import { I18n } from "../src/i18n.service";
import { JsonFileReaderNoopAdapter } from "../src/json-file-reader-noop.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { PrerequisiteTranslations } from "../src/prerequisites/translations";
import * as mocks from "./mocks";

const supportedLanguages = { en: "en", es: "es" };

const Logger = new LoggerNoopAdapter();
const JsonFileReader = new JsonFileReaderNoopAdapter({});
const deps = { Logger, JsonFileReader };

describe("PrerequisiteTranslations", () => {
  test("success", async () => {
    spyOn(fsp, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteTranslations(
      { label: "i18n", supportedLanguages: { en: "en" } },
      deps,
    );

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - missing file", async () => {
    spyOn(fsp, "access").mockRejectedValue(new Error("Does not exist"));
    const prerequisite = new PrerequisiteTranslations({ label: "i18n", supportedLanguages }, deps);

    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(/Does not exist/);
  });

  test("failure - inconsistent translations", async () => {
    spyOn(fsp, "access").mockImplementation(jest.fn());
    spyOn(I18n.prototype, "getTranslations").mockImplementation(async (language: string) => {
      switch (language) {
        case "en":
          return { key1: "English Translation 1", key2: "English Translation 2" };
        case "es":
          return { key1: "Spanish Translation 1" };
        default:
          return {} as any;
      }
    });
    const prerequisite = new PrerequisiteTranslations({ label: "i18n", supportedLanguages }, deps);

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: "Key: key2, exists in en, missing in es" }),
    );
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteTranslations(
      { label: "i18n", supportedLanguages, enabled: false },
      deps,
    );

    expect(await prerequisite.verify()).toEqual(mocks.VerificationUndetermined);
  });
});
