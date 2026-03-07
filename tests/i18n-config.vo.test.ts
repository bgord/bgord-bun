import { describe, expect, test } from "bun:test";
import { I18nConfig } from "../src/i18n-config.vo";

enum SupportedLanguages {
  en = "en",
  pl = "pl",
}

describe("I18nConfig", () => {
  test("happy path", () => {
    expect(() => new I18nConfig(SupportedLanguages, SupportedLanguages.en)).not.toThrow();
  });

  test("supported - empty", () => {
    expect(() => new I18nConfig({}, SupportedLanguages.en)).toThrow("i18n.config.empty");
  });

  test("supported - empty", () => {
    expect(() => new I18nConfig(SupportedLanguages, "es")).toThrow("i18n.config.fallback.not.supported");
  });
});
