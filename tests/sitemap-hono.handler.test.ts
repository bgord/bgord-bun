import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { type Context, Hono } from "hono";
import * as v from "valibot";
import { Sitemap } from "../src/sitemap.service";
import { SitemapChangefreqEnum } from "../src/sitemap-changefreq.vo";
import { SitemapEntriesProviderStaticAdapter } from "../src/sitemap-entries-provider-static.adapter";
import { SitemapEntry } from "../src/sitemap-entry.vo";
import { SitemapHonoHandler } from "../src/sitemap-hono.handler";
import { SitemapPriority } from "../src/sitemap-priority.vo";
import { SitemapUrl } from "../src/sitemap-url.vo";
import * as mocks from "./mocks";

const one = v.parse(SitemapUrl, "https://one.com/");
const two = v.parse(SitemapUrl, "https://two.com");

const lastmod = v.parse(tools.DayIsoId, "2025-01-01");
const priority = v.parse(SitemapPriority, 0.5);
const changefreq = SitemapChangefreqEnum.monthly;

const first = new SitemapEntry({ loc: one });
const second = new SitemapEntry({ loc: two, lastmod, changefreq, priority });

const onError = (error: Error, c: Context) => {
  if (error instanceof Error) return c.json({ message: error.message }, 400);
  return c.text("internal error", 500);
};

describe("SitemapHonoHandler", () => {
  test("empty", async () => {
    const provider = new SitemapEntriesProviderStaticAdapter([]);
    const sitemap = new Sitemap([provider]);
    const app = new Hono().get("/sitemap", ...new SitemapHonoHandler({ sitemap }).handle());

    const response = await app.request("/sitemap");

    expect(response.status).toEqual(200);
    expect(response.headers.get("Content-Type")).toEqual("application/xml");
    expect(await response.text()).toEqualIgnoringWhitespace(
      `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        </urlset>
      `,
    );
  });

  test("multiple providers", async () => {
    const sitemap = new Sitemap([
      new SitemapEntriesProviderStaticAdapter([first]),
      new SitemapEntriesProviderStaticAdapter([second]),
    ]);
    const app = new Hono().get("/sitemap", ...new SitemapHonoHandler({ sitemap }).handle());

    const response = await app.request("/sitemap");

    expect(response.status).toEqual(200);
    expect(response.headers.get("Content-Type")).toEqual("application/xml");
    expect(await response.text()).toEqualIgnoringWhitespace(
      `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url>
            <loc>https://one.com/</loc>
          </url>

          <url>
            <loc>https://two.com</loc>
            <lastmod>2025-01-01</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.5</priority>
          </url>
        </urlset>
      `,
    );
  });

  test("failure", async () => {
    const failure = new SitemapEntriesProviderStaticAdapter([first]);
    using _ = spyOn(failure, "produce").mockImplementation(mocks.throwIntentionalErrorAsync);
    const sitemap = new Sitemap([new SitemapEntriesProviderStaticAdapter([first]), failure]);
    const app = new Hono().get("/sitemap", ...new SitemapHonoHandler({ sitemap }).handle()).onError(onError);

    const response = await app.request("/sitemap");

    expect(response.status).toEqual(400);
    expect(response.headers.get("Content-Type")).toEqual("application/json");
    expect(await response.json()).toEqual({ message: mocks.IntentionalError });
  });
});
