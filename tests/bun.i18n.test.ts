import { describe, expect, it, spyOn } from "bun:test";
import { Hono } from "hono";
import { I18n, I18nVariablesType } from "../src/i18n";
import { Path } from "../src/path";

describe("I18n middleware", () => {
  const supportedLanguages = { en: "en", pl: "pl" };

  it("sets fallback language when cookie is missing", async () => {
    const app = new Hono<{ Variables: I18nVariablesType }>();
    app.use(I18n.applyTo({ supportedLanguages }));
    app.get("/", (c) => {
      return c.json({
        language: c.get("language"),
        supportedLanguages: c.get("supportedLanguages"),
        path: c.get("translationsPath"),
      });
    });

    const res = await app.request("/");
    const json = await res.json();

    expect(json.language).toBe("en");
    expect(json.supportedLanguages).toEqual(["en", "pl"]);
    expect(json.path.endsWith("infra/translations")).toBe(true);
  });

  it("uses language from supported cookie", async () => {
    const app = new Hono<{ Variables: I18nVariablesType }>();
    app.use(I18n.applyTo({ supportedLanguages }));
    app.get("/", (c) => c.text(c.get("language")));

    const res = await app.request("/", {
      headers: { cookie: "accept-language=pl" },
    });

    expect(await res.text()).toBe("pl");
  });

  it("falls back to default for unsupported language cookie", async () => {
    const app = new Hono<{ Variables: I18nVariablesType }>();
    app.use(I18n.applyTo({ supportedLanguages }));
    app.get("/", (c) => c.text(c.get("language")));

    const res = await app.request("/", {
      headers: { cookie: "accept-language=fr" },
    });

    expect(await res.text()).toBe("en");
  });

  it("uses custom defaultLanguage if provided", async () => {
    const app = new Hono();
    app.use(I18n.applyTo({ supportedLanguages, defaultLanguage: "pl" }));
    // @ts-expect-error
    app.get("/", (c) => c.text(c.get("language")));

    const res = await app.request("/");
    expect(await res.text()).toBe("pl");
  });
});

describe("I18n.getTranslationPathForLanguage", () => {
  it("returns the correct path for language", () => {
    const path = I18n.getTranslationPathForLanguage("en");
    expect(path.endsWith("infra/translations/en.json")).toBe(true);
  });

  it("uses custom translation path if provided", () => {
    const path = I18n.getTranslationPathForLanguage(
      "pl",
      Path.parse("custom/path"),
    );
    expect(path.endsWith("custom/path/pl.json")).toBe(true);
  });
});

describe("I18n.useTranslations", () => {
  const translations = { greeting: "Hello", welcome: "Welcome, {{name}}!" };

  const t = I18n.useTranslations(translations);

  it("returns the correct translation", () => {
    expect(t("greeting")).toBe("Hello");
  });

  it("replaces placeholders with variables", () => {
    expect(t("welcome", { name: "John" })).toBe("Welcome, John!");
  });

  it("returns key if translation is missing", () => {
    expect(t("nonexistent")).toBe("nonexistent");
  });
});

describe("I18n.getTranslations", () => {
  it("reads and parses translation file", async () => {
    // @ts-expect-error
    const bunFileSpy = spyOn(Bun, "file").mockReturnValue({
      json: async () => ({ hello: "Hello" }),
    });

    const result = await I18n.getTranslations(
      "en",
      Path.parse("infra/translations"),
    );
    expect(result).toEqual({ hello: "Hello" });
    expect(Bun.file).toHaveBeenCalledWith(expect.stringContaining("en.json"));

    bunFileSpy.mockRestore();
  });

  it("returns empty object on error", async () => {
    const bunFileSpy = spyOn(Bun, "file").mockImplementationOnce(() => {
      throw new Error("fail");
    });

    const result = await I18n.getTranslations(
      "en",
      Path.parse("infra/translations"),
    );
    expect(result).toEqual({});

    bunFileSpy.mockRestore();
  });
});
