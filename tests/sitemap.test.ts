import { describe, expect, spyOn, test } from "bun:test";

import {
  Sitemap,
  SitemapChangefreq,
  SitemapConfigType,
  SitemapLastmod,
  SitemapLoc,
  SitemapPriority,
} from "../src/sitemap";

describe("SitemapLoc", () => {
  test("passes with non-empty string", () => {
    const result = SitemapLoc.safeParse("https://example.com");
    expect(result.success).toBe(true);
  });

  test("fails with empty string", () => {
    const result = SitemapLoc.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("SitemapLastmod", () => {
  test("passes with valid YYYY-MM-DD date string", () => {
    const result = SitemapLastmod.safeParse("2023-01-05");
    expect(result.success).toBe(true);
  });

  test("fails with invalid format", () => {
    const result = SitemapLastmod.safeParse("10/05/2023");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("sitemap.lastmod.invalid");
    }
  });

  test("passes when omitted (optional)", () => {
    const result = SitemapLastmod.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  test("fails with invalid parts", () => {
    const result = SitemapLastmod.safeParse("2023-AB-12");
    expect(result.success).toBe(false);
  });
});

describe("SitemapChangefreq", () => {
  const validValues = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];

  for (const value of validValues) {
    test(`passes with value: ${value}`, () => {
      const result = SitemapChangefreq.safeParse(value);
      expect(result.success).toBe(true);
    });
  }

  test("fails with invalid string", () => {
    const result = SitemapChangefreq.safeParse("sometimes");
    expect(result.success).toBe(false);
  });

  test("passes when omitted (optional)", () => {
    const result = SitemapChangefreq.safeParse(undefined);
    expect(result.success).toBe(true);
  });
});

describe("SitemapPriority", () => {
  test("passes with a number between 0 and 1", () => {
    const result = SitemapPriority.safeParse(0.8);
    expect(result.success).toBe(true);
  });

  test("fails with number less than 0", () => {
    const result = SitemapPriority.safeParse(-0.1);
    expect(result.success).toBe(false);
  });

  test("fails with number greater than 1", () => {
    const result = SitemapPriority.safeParse(1.1);
    expect(result.success).toBe(false);
  });

  test("applies default value when undefined", () => {
    const result = SitemapPriority.parse(undefined);
    expect(result).toBe(0.5);
  });
});

describe("Sitemap.generate", () => {
  test("generates correct XML for full entry", () => {
    const config: SitemapConfigType = {
      BASE_URL: "https://example.com",
      entries: [
        {
          loc: "/page",
          lastmod: "2023-10-01",
          changefreq: "monthly",
          priority: 0.8,
        },
      ],
    };

    const xml = Sitemap.generate(config);

    expect(xml).toContain("<loc>https://example.com/page</loc>");
    expect(xml).toContain("<lastmod>2023-10-01</lastmod>");
    expect(xml).toContain("<changefreq>monthly</changefreq>");
    expect(xml).toContain("<priority>0.8</priority>");
    expect(xml).toStartWith('<?xml version="1.0"');
    expect(xml).toEndWith("</urlset>");
  });

  test("omits optional fields if not present", () => {
    const config: SitemapConfigType = {
      BASE_URL: "https://example.com",
      entries: [
        {
          loc: "/home",
          priority: 0.5,
        },
      ],
    };

    const xml = Sitemap.generate(config);

    expect(xml).toContain("<loc>https://example.com/home</loc>");
    expect(xml).not.toContain("<lastmod>");
    expect(xml).not.toContain("<changefreq>");
    expect(xml).toContain("<priority>0.5</priority>");
  });
});

describe("Sitemap.save", () => {
  test("writes sitemap to specified path", async () => {
    // @ts-expect-error
    const bunFileWrite = spyOn(Bun, "file").mockReturnValue({
      write: async () => 0,
    });

    const config: SitemapConfigType = {
      path: "my-custom-sitemap.xml",
      BASE_URL: "https://example.com",
      entries: [
        {
          loc: "/about",
          priority: 0.7,
        },
      ],
    };

    await Sitemap.save(config);

    expect(bunFileWrite).toHaveBeenCalledTimes(1);

    bunFileWrite.mockRestore();
  });

  test("writes sitemap to default path if not specified", async () => {
    // @ts-expect-error
    const bunFileWrite = spyOn(Bun, "file").mockReturnValue({
      write: async () => 0,
    });

    const config: SitemapConfigType = {
      BASE_URL: "https://example.com",
      entries: [
        {
          loc: "/contact",
          priority: 0.6,
        },
      ],
    };

    await Sitemap.save(config);

    expect(bunFileWrite).toHaveBeenCalledTimes(1);

    bunFileWrite.mockRestore();
  });
});
