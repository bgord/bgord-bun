import { describe, expect, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { languageDetector } from "hono/language";
import { Translations } from "../src/translations.service";

enum SupportedLanguages {
  en = "en",
  pl = "pl",
}

const app = new Hono();
app.use(
  languageDetector({
    supportedLanguages: Object.keys(SupportedLanguages),
    fallbackLanguage: SupportedLanguages.en,
  }),
);
app.get("/get-translations", ...Translations.build());

describe("GET /translations", () => {
  test("happy path - no language specified", async () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockReturnValue({ json: async () => ({ hello: "Hello" }) });

    const response = await app.request("/get-translations", { method: "GET" });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ translations: { hello: "Hello" }, language: "en" });
  });

  test("happy path - en", async () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockReturnValue({ json: async () => ({ hello: "Hello" }) });

    const response = await app.request("/get-translations", {
      method: "GET",
      headers: { cookie: `language=${SupportedLanguages.en}` },
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ translations: { hello: "Hello" }, language: "en" });
  });

  test("happy path - pl", async () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockReturnValue({ json: async () => ({ hello: "Hello" }) });

    const response = await app.request("/get-translations", {
      method: "GET",
      headers: { cookie: `language=${SupportedLanguages.pl}` },
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ translations: { hello: "Hello" }, language: "pl" });
  });

  test("happy path - other", async () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockReturnValue({ json: async () => ({ hello: "Hello" }) });

    const response = await app.request("/get-translations", {
      method: "GET",
      headers: { cookie: "language=fr" },
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ translations: { hello: "Hello" }, language: "en" });
  });
});
