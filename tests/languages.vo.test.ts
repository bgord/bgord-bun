import { describe, expect, test } from "bun:test";
import { Languages } from "../src/languages.vo";

const SupportedLanguages = ["en", "pl"] as const;

describe("Languages", () => {
  test("happy path", () => {
    expect(() => new Languages(SupportedLanguages, "en")).not.toThrow();
  });

  test("supported - empty", () => {
    expect(() => new Languages([], "en")).toThrow("languages.empty");
  });

  test("fallback not supported", () => {
    expect(() => new Languages(SupportedLanguages, "es")).toThrow("languages.fallback.not.supported");
  });

  test("supported", () => {
    expect(new Languages(SupportedLanguages, "en").supported).toEqual({ en: "en", pl: "pl" });
  });

  test("isSupported", () => {
    const i18n = new Languages(SupportedLanguages, "en");

    expect(i18n.isSupported("en")).toEqual(true);
    expect(i18n.isSupported("pl")).toEqual(true);
    expect(i18n.isSupported("es")).toEqual(false);
  });
});
