import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { I18nConfig } from "../src/i18n-config.vo";
import { LanguageDetectorCookieStrategy } from "../src/language-detector-cookie.strategy";
import { LanguageDetectorHeaderStrategy } from "../src/language-detector-header.strategy";
import {
  LanguageDetectorHonoMiddleware,
  type LanguageDetectorVariables,
} from "../src/language-detector-hono.middleware";
import { LanguageDetectorQueryStrategy } from "../src/language-detector-query.strategy";

type Config = { Variables: LanguageDetectorVariables };

const SupportedLanguages = ["en", "pl"] as const;
const i18n = new I18nConfig(SupportedLanguages, "en");

const query = new LanguageDetectorQueryStrategy("lang");
const cookie = new LanguageDetectorCookieStrategy("language");
const header = new LanguageDetectorHeaderStrategy();

describe("LanguageDetectorHonoMiddleware", () => {
  test("fallback - no strategies", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ i18n, strategies: [] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/");

    expect(await response.json()).toEqual(i18n.fallback);
  });

  test("fallback - no result", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ i18n, strategies: [query, cookie, header] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/");

    expect(await response.json()).toEqual(i18n.fallback);
  });

  test("happy path - query", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ i18n, strategies: [query] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request(`/?lang=${i18n.supported.pl}`);

    expect(await response.json()).toEqual(i18n.supported.pl);
  });

  test("happy path - cookie", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ i18n, strategies: [cookie] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/", { headers: { Cookie: `language=${i18n.supported.pl}` } });

    expect(await response.json()).toEqual(i18n.supported.pl);
  });

  test("happy path - header", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ i18n, strategies: [header] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/", { headers: { "Accept-Language": "pl-PL" } });

    expect(await response.json()).toEqual(i18n.supported.pl);
  });

  test("cascade - first", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ i18n, strategies: [query, cookie, header] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request(`/?lang=${i18n.supported.en}`, {
      headers: { Cookie: `language=${i18n.supported.pl}`, "Accept-Language": i18n.supported.pl },
    });

    expect(await response.json()).toEqual(i18n.supported.en);
  });

  test("cascade - second", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ i18n, strategies: [query, cookie, header] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/", {
      headers: { Cookie: `language=${i18n.supported.pl}`, "Accept-Language": i18n.supported.pl },
    });

    expect(await response.json()).toEqual(i18n.supported.pl);
  });

  test("cascade - third", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ i18n, strategies: [query, cookie, header] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/", { headers: { "Accept-Language": i18n.supported.pl } });

    expect(await response.json()).toEqual(i18n.supported.pl);
  });

  test("cascade - fallback", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ i18n, strategies: [query, cookie, header] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/");

    expect(await response.json()).toEqual(i18n.supported.en);
  });
});
