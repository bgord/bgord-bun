import type { Context } from "hono";
import type { CacheSubjectSegmentStrategy, CacheSubjectSegmentType } from "./cache-subject-segment.strategy";
import type { Hash } from "./hash.vo";
import type { HashContentStrategy } from "./hash-content.strategy";

type Dependencies = { HashContent: HashContentStrategy };

export const CacheSubjectResolverError = {
  NoSegments: "cache.subject.no.segments",
  TooManySegments: "cache.subject.too.many.segments",
};

export class CacheSubjectResolver {
  private readonly SEPARATOR = "|";

  constructor(
    private readonly segments: CacheSubjectSegmentStrategy[],
    private readonly deps: Dependencies,
  ) {
    if (this.segments.length === 0) throw new Error(CacheSubjectResolverError.NoSegments);
    if (this.segments.length > 10) throw new Error(CacheSubjectResolverError.TooManySegments);
  }

  async resolve(context?: Context): Promise<{ hex: Hash; raw: CacheSubjectSegmentType[] }> {
    const segments = this.segments.map((segment) =>
      segment.create(context).replaceAll(this.SEPARATOR, encodeURIComponent(this.SEPARATOR)),
    );
    const subject = segments.join(this.SEPARATOR);

    const hex = await this.deps.HashContent.hash(subject);

    return { hex, raw: segments };
  }
}
