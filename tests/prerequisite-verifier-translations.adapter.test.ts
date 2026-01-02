import { describe, expect, jest, spyOn, test } from "bun:test";
import { constants } from "node:fs";
import fsp from "node:fs/promises";
import * as tools from "@bgord/tools";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { I18n } from "../src/i18n.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { PrerequisiteVerifierTranslationsAdapter } from "../src/prerequisite-verifier-translations.adapter";
import * as mocks from "./mocks";

const supportedLanguages = { en: "en", es: "es" };

const Logger = new LoggerNoopAdapter();
const FileReaderJson = new FileReaderJsonNoopAdapter({});
const deps = { Logger, FileReaderJson };

describe("PrerequisiteVerifierTranslationsAdapter", () => {
  test("success", async () => {
    const fspAccess = spyOn(fsp, "access").mockResolvedValue(undefined);
    const getTranslations = spyOn(I18n.prototype, "getTranslations");
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter(
      { supportedLanguages: { en: "en" } },
      deps,
    );

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(getTranslations).not.toHaveBeenCalled();
    expect(fspAccess).toHaveBeenCalledTimes(2);
  });

  test("success - custom path", async () => {
    const fspAccess = spyOn(fsp, "access").mockResolvedValue(undefined);
    const translationsPath = tools.DirectoryPathRelativeSchema.parse("custom/translations");
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter(
      { translationsPath, supportedLanguages: { en: "en" } },
      deps,
    );

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(fspAccess).toHaveBeenCalledWith(translationsPath, constants.R_OK);
  });

  test("success - multiple languages have the same translation keys", async () => {
    spyOn(fsp, "access").mockResolvedValue(undefined);
    spyOn(I18n.prototype, "getTranslations").mockResolvedValue({ shared: "value" } as any);

    const prerequisite = new PrerequisiteVerifierTranslationsAdapter({ supportedLanguages }, deps);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - missing file", async () => {
    spyOn(fsp, "access").mockRejectedValue(new Error("Does not exist"));
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter({ supportedLanguages }, deps);

    // @ts-expect-error
    const result = (await prerequisite.verify()).error.message;

    expect(result).toMatch(/Does not exist/);
  });

  test("failure - inconsistent translations", async () => {
    spyOn(fsp, "access").mockResolvedValue(undefined);
    spyOn(I18n.prototype, "getTranslations").mockImplementation(async (language: string) => {
      switch (language) {
        case "en":
          return {
            key1: "English Translation 1",
            key2: "English Translation 2",
            key3: "English Translation 3",
          };
        case "es":
          return { key1: "Spanish Translation 1" };
        default:
          return {} as any;
      }
    });
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter({ supportedLanguages }, deps);

    const result = await prerequisite.verify();

    // @ts-expect-error
    const message = result.error.message;
    const lines = message.split("\n");
    expect(lines).toHaveLength(2);
    expect(message).toEqual(
      "Key: key2, exists in en, missing in es\n" + "Key: key3, exists in en, missing in es",
    );
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter({ supportedLanguages }, deps);

    expect(prerequisite.kind).toEqual("translations");
  });
});
