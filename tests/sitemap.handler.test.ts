import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { SitemapHandler } from "../src/sitemap.handler";
import { Sitemap } from "../src/sitemap.service";
import { SitemapChangefreqEnum } from "../src/sitemap-changefreq.vo";
import { SitemapEntriesProviderStaticAdapter } from "../src/sitemap-entries-provider-static.adapter";
import { SitemapEntry } from "../src/sitemap-entry.vo";
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

describe("SitemapHandler", () => {
  test("empty", async () => {
    const provider = new SitemapEntriesProviderStaticAdapter([]);
    const sitemap = new Sitemap([provider]);
    const handler = new SitemapHandler({ sitemap });

    const xml = await handler.generate();

    expect(xml).toEqualIgnoringWhitespace(
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
    const handler = new SitemapHandler({ sitemap });

    const xml = await handler.generate();

    expect(xml).toEqualIgnoringWhitespace(
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

    expect(async () => new SitemapHandler({ sitemap }).generate()).toThrow(mocks.IntentionalError);
  });
});
