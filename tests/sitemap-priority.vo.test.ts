import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { SitemapPriority } from "../src/sitemap-priority.vo";

describe("SitemapPriority", () => {
  test("happy path", () => {
    expect(v.safeParse(SitemapPriority, 0).success).toEqual(true);
    expect(v.safeParse(SitemapPriority, 0.5).success).toEqual(true);
    expect(v.safeParse(SitemapPriority, 1).success).toEqual(true);
  });

  test("rejects non-number - null", () => {
    expect(() => v.parse(SitemapPriority, null)).toThrow("sitemap.priority.invalid");
  });

  test("rejects non-number - string", () => {
    expect(() => v.parse(SitemapPriority, "0.5")).toThrow("sitemap.priority.invalid");
  });

  test("rejects below range", () => {
    expect(() => v.parse(SitemapPriority, -0.1)).toThrow("sitemap.priority.invalid");
  });

  test("rejects above range", () => {
    expect(() => v.parse(SitemapPriority, 1.1)).toThrow("sitemap.priority.invalid");
  });
});
