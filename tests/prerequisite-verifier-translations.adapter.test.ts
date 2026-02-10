import { describe, expect, spyOn, test } from "bun:test";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { I18n, type TranslationsType } from "../src/i18n.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierTranslationsAdapter } from "../src/prerequisite-verifier-translations.adapter";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const FileReaderJson = new FileReaderJsonNoopAdapter({});
const deps = { Logger, FileReaderJson };

const prerequisite = new PrerequisiteVerifierTranslationsAdapter(
  { supportedLanguages: { en: "en", pl: "pl" } },
  deps,
);

describe("PrerequisiteVerifierTranslationsAdapter", () => {
  test("success - single language", async () => {
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter(
      { supportedLanguages: { en: "en" } },
      deps,
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("success - two languages", async () => {
    using _ = spyOn(I18n.prototype, "getTranslations").mockImplementation(
      async (language: string): Promise<TranslationsType> => {
        switch (language) {
          case "en":
            return { dog: "dog", cat: "cat", cow: "cow" };
          case "pl":
            return { dog: "pies", cat: "kot", cow: "krowa" };
          default:
            return {};
        }
      },
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - one language translations not available", async () => {
    using _ = spyOn(I18n.prototype, "getTranslations").mockImplementation(
      async (language: string): Promise<TranslationsType> => {
        switch (language) {
          case "en":
            return { dog: "dog", cat: "cat", cow: "cow" };
          case "pl":
            throw mocks.throwIntentionalErrorAsync;
          default:
            return {};
        }
      },
    );

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("pl translations not available"),
    );
  });

  test("failure - both language translations not available", async () => {
    using _ = spyOn(I18n.prototype, "getTranslations").mockImplementation(async (language: string) => {
      switch (language) {
        case "en":
          throw mocks.throwIntentionalErrorAsync;
        case "pl":
          throw mocks.throwIntentionalErrorAsync;
        default:
          return {};
      }
    });

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("en translations not available"),
    );
  });

  test("failure - one difference", async () => {
    using _ = spyOn(I18n.prototype, "getTranslations").mockImplementation(
      async (language: string): Promise<TranslationsType> => {
        switch (language) {
          case "en":
            return { dog: "dog", cat: "cat", cow: "cow" };
          case "pl":
            return { dog: "pies", cat: "kot" };
          default:
            return {};
        }
      },
    );

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("Key: cow, exists in en, missing in pl"),
    );
  });

  test("failure - one empty", async () => {
    using _ = spyOn(I18n.prototype, "getTranslations").mockImplementation(
      async (language: string): Promise<TranslationsType> => {
        switch (language) {
          case "en":
            return { dog: "dog", cat: "cat", cow: "cow" };
          case "pl":
            return {};
          default:
            return {};
        }
      },
    );

    const summary = [
      "Key: dog, exists in en, missing in pl",
      "Key: cat, exists in en, missing in pl",
      "Key: cow, exists in en, missing in pl",
    ];
    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure(summary.join("\n")));
  });

  test("failure - both different", async () => {
    using _ = spyOn(I18n.prototype, "getTranslations").mockImplementation(
      async (language: string): Promise<TranslationsType> => {
        switch (language) {
          case "en":
            return { dog: "dog", cat: "cat", horse: "horse" };
          case "pl":
            return { dog: "pies", cat: "kot", sheep: "owca" };
          default:
            return {};
        }
      },
    );

    const summary = ["Key: horse, exists in en, missing in pl", "Key: sheep, exists in pl, missing in en"];
    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure(summary.join("\n")));
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("translations");
  });
});
