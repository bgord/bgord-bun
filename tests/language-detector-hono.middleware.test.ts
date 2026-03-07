import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { LanguageDetectorCookieStrategy } from "../src/language-detector-cookie.strategy";
import { LanguageDetectorHeaderStrategy } from "../src/language-detector-header.strategy";
import {
  LanguageDetectorHonoMiddleware,
  type LanguageDetectorVariables,
} from "../src/language-detector-hono.middleware";
import { LanguageDetectorQueryStrategy } from "../src/language-detector-query.strategy";
import { Languages } from "../src/languages.vo";

type Config = { Variables: LanguageDetectorVariables };

const SupportedLanguages = ["en", "pl"] as const;
const languages = new Languages(SupportedLanguages, "en");

const query = new LanguageDetectorQueryStrategy("lang");
const cookie = new LanguageDetectorCookieStrategy("language");
const header = new LanguageDetectorHeaderStrategy();

describe("LanguageDetectorHonoMiddleware", () => {
  test("fallback - no strategies", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ languages, strategies: [] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/");

    expect(await response.json()).toEqual(languages.fallback);
  });

  test("fallback - no result", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ languages, strategies: [query, cookie, header] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/");

    expect(await response.json()).toEqual(languages.fallback);
  });

  test("happy path - query", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ languages, strategies: [query] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request(`/?lang=${languages.supported.pl}`);

    expect(await response.json()).toEqual(languages.supported.pl);
  });

  test("happy path - cookie", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ languages, strategies: [cookie] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/", { headers: { Cookie: `language=${languages.supported.pl}` } });

    expect(await response.json()).toEqual(languages.supported.pl);
  });

  test("happy path - header", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ languages, strategies: [header] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/", { headers: { "Accept-Language": "pl-PL" } });

    expect(await response.json()).toEqual(languages.supported.pl);
  });

  test("cascade - first", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ languages, strategies: [query, cookie, header] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request(`/?lang=${languages.supported.en}`, {
      headers: { Cookie: `language=${languages.supported.pl}`, "Accept-Language": languages.supported.pl },
    });

    expect(await response.json()).toEqual(languages.supported.en);
  });

  test("cascade - second", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ languages, strategies: [query, cookie, header] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/", {
      headers: { Cookie: `language=${languages.supported.pl}`, "Accept-Language": languages.supported.pl },
    });

    expect(await response.json()).toEqual(languages.supported.pl);
  });

  test("cascade - third", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ languages, strategies: [query, cookie, header] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/", { headers: { "Accept-Language": languages.supported.pl } });

    expect(await response.json()).toEqual(languages.supported.pl);
  });

  test("cascade - fallback", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ languages, strategies: [query, cookie, header] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/");

    expect(await response.json()).toEqual(languages.supported.en);
  });
});
