import { describe, expect, test } from "bun:test";
import { Languages } from "../src/languages.vo";
import * as mocks from "./mocks";

describe("Languages", () => {
  test("happy path", () => {
    expect(() => new Languages(mocks.SupportedLanguages, "en")).not.toThrow();
  });

  test("supported - empty", () => {
    expect(() => new Languages([], "en")).toThrow("languages.empty");
  });

  test("fallback not supported", () => {
    expect(() => new Languages(mocks.SupportedLanguages, "es")).toThrow("languages.fallback.not.supported");
  });

  test("supported", () => {
    expect(new Languages(mocks.SupportedLanguages, "en").supported).toEqual({ en: "en", pl: "pl" });
  });

  test("isSupported", () => {
    const i18n = new Languages(mocks.SupportedLanguages, "en");

    expect(i18n.isSupported("en")).toEqual(true);
    expect(i18n.isSupported("pl")).toEqual(true);
    expect(i18n.isSupported("es")).toEqual(false);
    expect(i18n.isSupported(12)).toEqual(false);
  });
});
