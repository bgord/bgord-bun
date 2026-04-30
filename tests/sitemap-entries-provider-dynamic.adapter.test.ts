import { describe, expect, spyOn, test } from "bun:test";
import * as v from "valibot";
import { Sitemap } from "../src/sitemap.service";
import { SitemapEntriesProviderDynamicAdapter } from "../src/sitemap-entries-provider-dynamic.adapter";
import { SitemapEntry } from "../src/sitemap-entry.vo";
import { SitemapUrl } from "../src/sitemap-url.vo";
import * as mocks from "./mocks";

type Article = { slug: string };

const one: Article = { slug: "one" };
const two: Article = { slug: "two" };

describe("SitemapEntriesProviderDynamicAdapter", () => {
  test("empty", async () => {
    const adapter = new SitemapEntriesProviderDynamicAdapter<Article>({
      fetcher: async () => [],
      mapper: (item) => new SitemapEntry({ loc: v.parse(SitemapUrl, `https://a.com/${item.slug}`) }),
    });
    const sitemap = new Sitemap([adapter]);

    expect(await sitemap.toXml()).toEqualIgnoringWhitespace(
      `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        </urlset>
      `,
    );
  });

  test("multiple results", async () => {
    const adapter = new SitemapEntriesProviderDynamicAdapter<Article>({
      fetcher: async () => [one, two],
      mapper: (item) => new SitemapEntry({ loc: v.parse(SitemapUrl, `https://a.com/${item.slug}`) }),
    });
    const sitemap = new Sitemap([adapter]);

    expect(await sitemap.toXml()).toEqualIgnoringWhitespace(
      `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url><loc>https://a.com/one</loc></url>
          <url><loc>https://a.com/two</loc></url>
        </urlset>
      `,
    );
  });

  test("fetcher failure", async () => {
    const config = {
      fetcher: async (): Promise<ReadonlyArray<Article>> => [],
      mapper: () => new SitemapEntry({ loc: v.parse(SitemapUrl, "https://a.com") }),
    };
    using _ = spyOn(config, "fetcher").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new SitemapEntriesProviderDynamicAdapter(config);
    const sitemap = new Sitemap([adapter]);

    expect(async () => sitemap.toXml()).toThrow(mocks.IntentionalError);
  });

  test("mapper failure", async () => {
    const adapter = new SitemapEntriesProviderDynamicAdapter<Article>({
      fetcher: async () => [one],
      mapper: mocks.throwIntentionalError,
    });
    const sitemap = new Sitemap([adapter]);

    expect(async () => sitemap.toXml()).toThrow(mocks.IntentionalError);
  });
});
