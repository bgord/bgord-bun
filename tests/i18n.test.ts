import { describe, expect, jest, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { languageDetector } from "hono/language";
import { I18n } from "../src/i18n.service";
import { Path } from "../src/path.vo";

describe("I18n middleware", () => {
  const supportedLanguages = { en: "en", pl: "pl" };

  test("sets fallback language when cookie is missing", async () => {
    const app = new Hono();
    app.use(
      languageDetector({
        supportedLanguages: [supportedLanguages.en, supportedLanguages.pl],
        fallbackLanguage: supportedLanguages.en,
      }),
    );
    app.get("/", (c) => c.json({ language: c.get("language") }));

    const res = await app.request("/");
    const json = await res.json();

    expect(json.language).toBe("en");
  });

  test("uses language from supported cookie", async () => {
    const app = new Hono();
    app.use(
      languageDetector({
        supportedLanguages: [supportedLanguages.en, supportedLanguages.pl],
        fallbackLanguage: supportedLanguages.en,
      }),
    );
    app.get("/", (c) => c.text(c.get("language")));

    const res = await app.request("/", {
      headers: { cookie: "language=pl" },
    });

    expect(await res.text()).toBe("pl");
  });

  test("falls back to default for unsupported language cookie", async () => {
    const app = new Hono();
    app.use(
      languageDetector({
        supportedLanguages: [supportedLanguages.en, supportedLanguages.pl],
        fallbackLanguage: supportedLanguages.en,
      }),
    );
    app.get("/", (c) => c.text(c.get("language")));

    const res = await app.request("/", {
      headers: { cookie: "language=fr" },
    });

    expect(await res.text()).toBe("en");
  });

  test("uses custom defaultLanguage if provided", async () => {
    const app = new Hono();
    app.use(
      languageDetector({
        supportedLanguages: [supportedLanguages.en, supportedLanguages.pl],
        fallbackLanguage: supportedLanguages.pl,
      }),
    );
    app.get("/", (c) => c.text(c.get("language")));

    const res = await app.request("/");
    expect(await res.text()).toBe("pl");
  });
});

describe("I18n.getTranslationPathForLanguage", () => {
  test("returns the correct path for language", () => {
    const path = new I18n().getTranslationPathForLanguage("en");
    expect(path.endsWith("infra/translations/en.json")).toBe(true);
  });

  test("uses custom translation path if provided", () => {
    const path = new I18n(Path.parse("custom/path")).getTranslationPathForLanguage("pl");
    expect(path.endsWith("custom/path/pl.json")).toBe(true);
  });
});

describe("I18n.useTranslations", () => {
  const translations = { greeting: "Hello", welcome: "Welcome, {{name}}!" };

  const t = new I18n().useTranslations(translations);

  test("returns the correct translation", () => {
    expect(t("greeting")).toBe("Hello");
  });

  test("replaces placeholders with variables", () => {
    expect(t("welcome", { name: "John" })).toBe("Welcome, John!");
  });

  test("returns key if translation is missing", () => {
    const consoleWarn = spyOn(console, "warn").mockImplementation(jest.fn());
    expect(t("nonexistent")).toBe("nonexistent");
    consoleWarn.mockRestore();
  });
});

describe("I18n.getTranslations", () => {
  test("reads and parses translation file", async () => {
    // @ts-expect-error
    const bunFileJson = spyOn(Bun, "file").mockReturnValue({
      json: async () => ({ hello: "Hello" }),
    });

    const result = await new I18n().getTranslations("en");
    expect(result).toEqual({ hello: "Hello" });
    expect(Bun.file).toHaveBeenCalledWith(expect.stringContaining("en.json"));

    bunFileJson.mockRestore();
  });

  test("returns empty object on error", async () => {
    const bunFile = spyOn(Bun, "file").mockImplementationOnce(() => {
      throw new Error("fail");
    });

    const result = await new I18n().getTranslations("en");
    expect(result).toEqual({});

    bunFile.mockRestore();
  });
});
