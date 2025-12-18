import type { Context } from "hono";
import type { CacheSubjectSegmentPort, CacheSubjectSegmentType } from "./cache-subject-segment.port";
import type { Hash } from "./hash.vo";
import type { HashContentPort } from "./hash-content.port";

type Dependencies = { HashContent: HashContentPort };

export const CacheSubjectResolverError = { NoSegments: "cache.subject.no.segments" };

export class CacheSubjectResolver {
  private readonly SEPARATOR = "|";

  constructor(
    private readonly segments: CacheSubjectSegmentPort[],
    private readonly deps: Dependencies,
  ) {
    if (this.segments.length === 0) throw new Error(CacheSubjectResolverError.NoSegments);
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
