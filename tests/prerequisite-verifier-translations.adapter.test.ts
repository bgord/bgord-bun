// cspell:ignore krowa,owca
import { describe, expect, spyOn, test } from "bun:test";
import { Languages } from "../src/languages.vo";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierTranslationsAdapter } from "../src/prerequisite-verifier-translations.adapter";
import { TranslationsProviderNoopAdapter } from "../src/translations-provider-noop.adapter";
import * as mocks from "./mocks";

const SupportedLanguages = ["en", "pl"] as const;
const languages = new Languages(SupportedLanguages, "en");

describe("PrerequisiteVerifierTranslationsAdapter", () => {
  test("success - single language", async () => {
    const SupportedLanguages = ["en"] as const;
    const languages = new Languages(SupportedLanguages, "en");
    const TranslationsProvider = new TranslationsProviderNoopAdapter(SupportedLanguages, {
      en: { hello: "Hello" },
    });
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter(languages, { TranslationsProvider });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("success - two languages", async () => {
    const TranslationsProvider = new TranslationsProviderNoopAdapter(SupportedLanguages, {
      en: { dog: "dog", cat: "cat", cow: "cow" },
      pl: { dog: "pies", cat: "kot", cow: "krowa" },
    });
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter(languages, { TranslationsProvider });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - one language translations not available", async () => {
    const TranslationsProvider = new TranslationsProviderNoopAdapter(SupportedLanguages, {
      en: { dog: "dog", cat: "cat", cow: "cow" },
    });
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter(languages, { TranslationsProvider });
    using _ = spyOn(TranslationsProvider, "getTranslationsFor")
      .mockImplementationOnce(async () => ({ dog: "dog", cat: "cat", cow: "cow" }))
      .mockImplementationOnce(mocks.throwIntentionalErrorAsync);

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("pl translations not available"),
    );
  });

  test("failure - both language translations not available", async () => {
    const TranslationsProvider = new TranslationsProviderNoopAdapter(SupportedLanguages, {});
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter(languages, { TranslationsProvider });

    using _ = spyOn(TranslationsProvider, "getTranslationsFor").mockImplementation(
      mocks.throwIntentionalErrorAsync,
    );

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("en translations not available"),
    );
  });

  test("failure - one difference", async () => {
    const TranslationsProvider = new TranslationsProviderNoopAdapter(SupportedLanguages, {
      en: { dog: "dog", cat: "cat", cow: "cow" },
      pl: { dog: "pies", cat: "kot" },
    });
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter(languages, { TranslationsProvider });

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("Key: cow, exists in en, missing in pl"),
    );
  });

  test("failure - one empty", async () => {
    const summary = [
      "Key: dog, exists in en, missing in pl",
      "Key: cat, exists in en, missing in pl",
      "Key: cow, exists in en, missing in pl",
    ];

    const TranslationsProvider = new TranslationsProviderNoopAdapter(SupportedLanguages, {
      en: { dog: "dog", cat: "cat", cow: "cow" },
      pl: {},
    });
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter(languages, { TranslationsProvider });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure(summary.join("\n")));
  });

  test("failure - both different", async () => {
    const summary = ["Key: horse, exists in en, missing in pl", "Key: sheep, exists in pl, missing in en"];

    const TranslationsProvider = new TranslationsProviderNoopAdapter(SupportedLanguages, {
      en: { dog: "dog", cat: "cat", horse: "horse" },
      pl: { dog: "pies", cat: "kot", sheep: "owca" },
    });
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter(languages, { TranslationsProvider });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure(summary.join("\n")));
  });

  test("kind", () => {
    const TranslationsProvider = new TranslationsProviderNoopAdapter(SupportedLanguages, {
      en: { hello: "Hello" },
    });
    const prerequisite = new PrerequisiteVerifierTranslationsAdapter(languages, { TranslationsProvider });

    expect(prerequisite.kind).toEqual("translations");
  });
});
