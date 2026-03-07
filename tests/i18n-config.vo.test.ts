import { describe, expect, test } from "bun:test";
import { I18nConfig } from "../src/i18n-config.vo";

const SupportedLanguages = ["en", "pl"] as const;

describe("I18nConfig", () => {
  test("happy path", () => {
    expect(() => new I18nConfig(SupportedLanguages, "en")).not.toThrow();
  });

  test("supported - empty", () => {
    expect(() => new I18nConfig([], "en")).toThrow("i18n.config.empty");
  });

  test("fallback not supported", () => {
    expect(() => new I18nConfig(SupportedLanguages, "es")).toThrow("i18n.config.fallback.not.supported");
  });

  test("supported", () => {
    expect(new I18nConfig(SupportedLanguages, "en").supported).toEqual({ en: "en", pl: "pl" });
  });

  test("isSupported", () => {
    const i18n = new I18nConfig(SupportedLanguages, "en");

    expect(i18n.isSupported("en")).toEqual(true);
    expect(i18n.isSupported("pl")).toEqual(true);
    expect(i18n.isSupported("es")).toEqual(false);
  });
});
