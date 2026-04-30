import * as v from "valibot";

export const SitemapPriorityError = { Invalid: "sitemap.priority.invalid" };

export const SitemapPriority = v.pipe(
  v.number(SitemapPriorityError.Invalid),
  v.minValue(0, SitemapPriorityError.Invalid),
  v.maxValue(1, SitemapPriorityError.Invalid),
  // Stryker disable next-line StringLiteral
  v.brand("SitemapPriority"),
);

export type SitemapPriorityType = v.InferOutput<typeof SitemapPriority>;
