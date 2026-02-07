import type {
  CacheSubjectSegmentRequestStrategy,
  CacheSubjectSegmentType,
} from "./cache-subject-segment-request.strategy";
import type { Hash } from "./hash.vo";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { RequestContext } from "./request-context.port";

type Dependencies = { HashContent: HashContentStrategy };

export const CacheSubjectRequestResolverError = {
  NoSegments: "cache.subject.request.no.segments",
  TooManySegments: "cache.subject.request.too.many.segments",
};

export class CacheSubjectRequestResolver {
  private readonly SEPARATOR = "|";

  constructor(
    private readonly segments: ReadonlyArray<CacheSubjectSegmentRequestStrategy>,
    private readonly deps: Dependencies,
  ) {
    if (this.segments.length === 0) throw new Error(CacheSubjectRequestResolverError.NoSegments);
    if (this.segments.length > 10) throw new Error(CacheSubjectRequestResolverError.TooManySegments);
  }

  async resolve(
    context: RequestContext,
  ): Promise<{ hex: Hash; raw: ReadonlyArray<CacheSubjectSegmentType> }> {
    const segments = this.segments.map((segment) =>
      segment.create(context).replaceAll(this.SEPARATOR, encodeURIComponent(this.SEPARATOR)),
    );
    const subject = segments.join(this.SEPARATOR);

    const hex = await this.deps.HashContent.hash(subject);

    return { hex, raw: segments };
  }
}
