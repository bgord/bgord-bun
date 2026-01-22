import { describe, expect, test } from "bun:test";
import { SupportedLanguagesSet } from "../src/modules/preferences/value-objects";

export enum SupportedLanguages {
  en = "en",
  pl = "pl",
}

export const SUPPORTED_LANGUAGES = [SupportedLanguages.en, SupportedLanguages.pl];

const supportedLanguagesSet = new SupportedLanguagesSet(SUPPORTED_LANGUAGES);

describe("SupportedLanguagesSet VO", () => {
  test("ensures the correct language type", () => {
    expect(supportedLanguagesSet.ensure(SupportedLanguages.en)).toEqual(SupportedLanguages.en);
  });

  test("throws on incorrect language", () => {
    expect(() => supportedLanguagesSet.ensure("de")).toThrow("supported.languages.set.error.missing");
  });
});
