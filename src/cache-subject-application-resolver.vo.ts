import type { CacheSubjectSegmentApplicationStrategy } from "./cache-subject-segment-application.strategy";
import type { CacheSubjectSegmentType } from "./cache-subject-segment-request.strategy";
import type { Hash } from "./hash.vo";
import type { HashContentStrategy } from "./hash-content.strategy";

type Dependencies = { HashContent: HashContentStrategy };

export const CacheSubjectApplicationResolverError = {
  NoSegments: "cache.subject.application.no.segments",
  TooManySegments: "cache.subject.application.too.many.segments",
};

export class CacheSubjectApplicationResolver {
  private readonly SEPARATOR = "|";

  constructor(
    private readonly segments: CacheSubjectSegmentApplicationStrategy[],
    private readonly deps: Dependencies,
  ) {
    if (this.segments.length === 0) throw new Error(CacheSubjectApplicationResolverError.NoSegments);
    if (this.segments.length > 10) throw new Error(CacheSubjectApplicationResolverError.TooManySegments);
  }

  async resolve(): Promise<{ hex: Hash; raw: CacheSubjectSegmentType[] }> {
    const segments = this.segments.map((segment) =>
      segment.create().replaceAll(this.SEPARATOR, encodeURIComponent(this.SEPARATOR)),
    );
    const subject = segments.join(this.SEPARATOR);

    const hex = await this.deps.HashContent.hash(subject);

    return { hex, raw: segments };
  }
}
