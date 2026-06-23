import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { SitemapChangefreqEnum } from "../src/sitemap-changefreq.vo";
import { SitemapEntry } from "../src/sitemap-entry.vo";
import { SitemapPriority } from "../src/sitemap-priority.vo";
import { SitemapUrl } from "../src/sitemap-url.vo";

const loc = v.parse(SitemapUrl, "https://example.com");
const lastmod = v.parse(tools.DayIsoId, "2025-01-01");
const priority = v.parse(SitemapPriority, 0.8);
const changefreq = SitemapChangefreqEnum.daily;

describe("SitemapEntry", () => {
  test("loc", () => {
    expect(new SitemapEntry({ loc }).toXml()).toEqual("<url><loc>https://example.com</loc></url>");
  });

  test("loc + lastmod", () => {
    expect(new SitemapEntry({ loc, lastmod }).toXml()).toEqual(
      "<url><loc>https://example.com</loc><lastmod>2025-01-01</lastmod></url>",
    );
  });

  test("loc + lastmod + changefreq", () => {
    expect(new SitemapEntry({ loc, lastmod, changefreq }).toXml()).toEqual(
      "<url><loc>https://example.com</loc><lastmod>2025-01-01</lastmod><changefreq>daily</changefreq></url>",
    );
  });

  test("loc + lastmod + changefreq + priority", () => {
    expect(new SitemapEntry({ loc, lastmod, changefreq, priority }).toXml()).toEqual(
      "<url><loc>https://example.com</loc><lastmod>2025-01-01</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>",
    );
  });

  test("loc escaping", () => {
    const loc = v.parse(SitemapUrl, "https://example.com/page?a=1&b=2<3\"4'5>");

    expect(new SitemapEntry({ loc }).toXml()).toEqual(
      "<url><loc>https://example.com/page?a=1&amp;b=2&lt;3&quot;4&apos;5&gt;</loc></url>",
    );
  });
});
