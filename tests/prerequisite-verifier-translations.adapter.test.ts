import { describe, expect, spyOn, test } from "bun:test";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { I18n } from "../src/i18n.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { PrerequisiteVerifierTranslationsAdapter } from "../src/prerequisite-verifier-translations.adapter";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const FileReaderJson = new FileReaderJsonNoopAdapter({});
const deps = { Logger, FileReaderJson };

const prerequisite = new PrerequisiteVerifierTranslationsAdapter(
  { supportedLanguages: { en: "en", pl: "pl" } },
  deps,
);

describe("PrerequisiteVerifierTranslationsAdapter V2", () => {
  test("success - single language", async () => {
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter(
      { supportedLanguages: { en: "en" } },
      deps,
    );

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("success - two languages", async () => {
    spyOn(I18n.prototype, "getTranslations").mockImplementation(async (language: string) => {
      switch (language) {
        case "en":
          return { dog: "dog", cat: "cat", cow: "cow" };
        case "pl":
          return { dog: "pies", cat: "kot", cow: "krowa" };
        default:
          return {} as any;
      }
    });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - one language translations not available", async () => {
    spyOn(I18n.prototype, "getTranslations").mockImplementation(async (language: string) => {
      switch (language) {
        case "en":
          return { dog: "dog", cat: "cat", cow: "cow" };
        case "pl":
          throw mocks.throwIntentionalErrorAsync;
        default:
          return {} as any;
      }
    });

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: "pl translations not available" }),
    );
  });

  test("failure - both language translations not available", async () => {
    spyOn(I18n.prototype, "getTranslations").mockImplementation(async (language: string) => {
      switch (language) {
        case "en":
          throw mocks.throwIntentionalErrorAsync;
        case "pl":
          throw mocks.throwIntentionalErrorAsync;
        default:
          return {} as any;
      }
    });

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: "en translations not available" }),
    );
  });

  test("failure - one difference", async () => {
    spyOn(I18n.prototype, "getTranslations").mockImplementation(async (language: string) => {
      switch (language) {
        case "en":
          return { dog: "dog", cat: "cat", cow: "cow" };
        case "pl":
          return { dog: "pies", cat: "kot" };
        default:
          return {} as any;
      }
    });

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: "Key: cow, exists in en, missing in pl" }),
    );
  });

  test("failure - one empty", async () => {
    spyOn(I18n.prototype, "getTranslations").mockImplementation(async (language: string) => {
      switch (language) {
        case "en":
          return { dog: "dog", cat: "cat", cow: "cow" };
        case "pl":
          return {};
        default:
          return {} as any;
      }
    });

    const summary = [
      "Key: dog, exists in en, missing in pl",
      "Key: cat, exists in en, missing in pl",
      "Key: cow, exists in en, missing in pl",
    ];
    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure({ message: summary.join("\n") }));
  });

  test("failure - both different", async () => {
    spyOn(I18n.prototype, "getTranslations").mockImplementation(async (language: string) => {
      switch (language) {
        case "en":
          return { dog: "dog", cat: "cat", horse: "horse" };
        case "pl":
          return { dog: "pies", cat: "kot", sheep: "owca" };
        default:
          return {} as any;
      }
    });

    const summary = ["Key: horse, exists in en, missing in pl", "Key: sheep, exists in pl, missing in en"];
    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure({ message: summary.join("\n") }));
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("translations");
  });
});
