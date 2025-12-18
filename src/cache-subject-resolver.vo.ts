import { createHash } from "node:crypto";
import type { Context } from "hono";
import type { CacheSubjectSegmentPort, CacheSubjectSegmentType } from "./cache-subject-segment.port";
import { Hash } from "./hash.vo";

export const CacheSubjectResolverError = { NoSegments: "cache.subject.no.segments" };

export class CacheSubjectResolver {
  private readonly SEPARATOR = "|";

  constructor(private readonly segments: CacheSubjectSegmentPort[]) {
    if (this.segments.length === 0) throw new Error(CacheSubjectResolverError.NoSegments);
  }

  resolve(context?: Context): { hex: Hash; raw: CacheSubjectSegmentType[] } {
    const segments = this.segments.map((segment) =>
      segment.create(context).replaceAll(this.SEPARATOR, encodeURIComponent(this.SEPARATOR)),
    );
    const subject = segments.join(this.SEPARATOR);

    const hex = createHash("sha256").update(subject).digest("hex");

    return { hex: Hash.fromString(hex), raw: segments };
  }
}
