import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { SitemapEntriesProviderStaticAdapter } from "../src/sitemap-entries-provider-static.adapter";
import { SitemapEntry } from "../src/sitemap-entry.vo";
import { SitemapUrl } from "../src/sitemap-url.vo";

const loc = v.parse(SitemapUrl, "https://example.com");

const entry = new SitemapEntry({ loc });

describe("SitemapEntriesProviderStaticAdapter", () => {
  test("happy path", async () => {
    expect(await new SitemapEntriesProviderStaticAdapter([entry]).produce()).toEqual([entry]);
  });

  test("empty", async () => {
    expect(await new SitemapEntriesProviderStaticAdapter([]).produce()).toEqual([]);
  });
});
