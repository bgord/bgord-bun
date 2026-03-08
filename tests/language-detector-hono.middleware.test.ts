import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { LanguageDetectorCookieStrategy } from "../src/language-detector-cookie.strategy";
import { LanguageDetectorHeaderStrategy } from "../src/language-detector-header.strategy";
import {
  LanguageDetectorHonoMiddleware,
  type LanguageDetectorVariables,
} from "../src/language-detector-hono.middleware";
import { LanguageDetectorQueryStrategy } from "../src/language-detector-query.strategy";
import * as mocks from "./mocks";

type Config = { Variables: LanguageDetectorVariables };

const query = new LanguageDetectorQueryStrategy("language");
const cookie = new LanguageDetectorCookieStrategy("language");
const header = new LanguageDetectorHeaderStrategy();

describe("LanguageDetectorHonoMiddleware", () => {
  test("fallback - no strategies", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({ languages: mocks.languages, strategies: [] });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/");

    expect(await response.json()).toEqual(mocks.languages.fallback);
  });

  test("fallback - no result", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({
      languages: mocks.languages,
      strategies: [query, cookie, header],
    });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/");

    expect(await response.json()).toEqual(mocks.languages.fallback);
  });

  test("happy path - query", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({
      languages: mocks.languages,
      strategies: [query],
    });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request(`/?language=${mocks.languages.supported.pl}`);

    expect(await response.json()).toEqual(mocks.languages.supported.pl);
  });

  test("happy path - cookie", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({
      languages: mocks.languages,
      strategies: [cookie],
    });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/", {
      headers: { Cookie: `language=${mocks.languages.supported.pl}` },
    });

    expect(await response.json()).toEqual(mocks.languages.supported.pl);
  });

  test("happy path - header", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({
      languages: mocks.languages,
      strategies: [header],
    });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/", { headers: { "Accept-Language": "pl-PL" } });

    expect(await response.json()).toEqual(mocks.languages.supported.pl);
  });

  test("cascade - first", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({
      languages: mocks.languages,
      strategies: [query, cookie, header],
    });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request(`/?language=${mocks.languages.supported.en}`, {
      headers: {
        Cookie: `language=${mocks.languages.supported.pl}`,
        "Accept-Language": mocks.languages.supported.pl,
      },
    });

    expect(await response.json()).toEqual(mocks.languages.supported.en);
  });

  test("cascade - second", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({
      languages: mocks.languages,
      strategies: [query, cookie, header],
    });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/", {
      headers: {
        Cookie: `language=${mocks.languages.supported.pl}`,
        "Accept-Language": mocks.languages.supported.pl,
      },
    });

    expect(await response.json()).toEqual(mocks.languages.supported.pl);
  });

  test("cascade - third", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({
      languages: mocks.languages,
      strategies: [query, cookie, header],
    });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/", { headers: { "Accept-Language": mocks.languages.supported.pl } });

    expect(await response.json()).toEqual(mocks.languages.supported.pl);
  });

  test("cascade - fallback", async () => {
    const middleware = new LanguageDetectorHonoMiddleware({
      languages: mocks.languages,
      strategies: [query, cookie, header],
    });
    const app = new Hono<Config>().use(middleware.handle()).get("/", (c) => c.json(c.get("language")));

    const response = await app.request("/");

    expect(await response.json()).toEqual(mocks.languages.supported.en);
  });

  test("just enough strategies", () => {
    expect(
      () =>
        new LanguageDetectorHonoMiddleware({
          languages: mocks.languages,
          strategies: tools.repeat(header, 5),
        }),
    ).not.toThrow();
  });

  test("max strategies", () => {
    expect(
      () =>
        new LanguageDetectorHonoMiddleware({
          languages: mocks.languages,
          strategies: tools.repeat(header, 6),
        }),
    ).toThrow("language.detector.middleware.max.strategies");
  });
});
