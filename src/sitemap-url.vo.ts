import * as tools from "@bgord/tools";
import * as v from "valibot";

export const SitemapUrlError = { Invalid: "sitemap.url.invalid" };

export const SitemapUrl = v.pipe(
  v.union([tools.UrlWithSlash, tools.UrlWithoutSlash], SitemapUrlError.Invalid),
  // Stryker disable next-line StringLiteral
  v.brand("SitemapUrl"),
);

export type SitemapUrlType = v.InferOutput<typeof SitemapUrl>;
