import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { SitemapUrl } from "../src/sitemap-url.vo";

describe("SitemapUrl", () => {
  test("happy path - without trailing slash", () => {
    expect(v.safeParse(SitemapUrl, "https://example.com").success).toEqual(true);
    expect(v.safeParse(SitemapUrl, "https://example.com/about").success).toEqual(true);
    expect(v.safeParse(SitemapUrl, "http://localhost:3000").success).toEqual(true);
  });

  test("happy path - with trailing slash", () => {
    expect(v.safeParse(SitemapUrl, "https://example.com/").success).toEqual(true);
    expect(v.safeParse(SitemapUrl, "https://example.com/about/").success).toEqual(true);
  });

  test("rejects empty", () => {
    expect(() => v.parse(SitemapUrl, "")).toThrow("sitemap.url.invalid");
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(SitemapUrl, null)).toThrow("sitemap.url.invalid");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(SitemapUrl, 123)).toThrow("sitemap.url.invalid");
  });

  test("rejects invalid url", () => {
    expect(() => v.parse(SitemapUrl, "not-a-url")).toThrow("sitemap.url.invalid");
  });
});
