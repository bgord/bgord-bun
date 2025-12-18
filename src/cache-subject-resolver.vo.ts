import { createHash } from "node:crypto";
import type { Context } from "hono";
import { CacheSubjectHex, type CacheSubjectHexType } from "./cache-subject-hex.vo";
import type { CacheSubjectSegmentPort, CacheSubjectSegmentType } from "./cache-subject-segment.port";

export const CacheSubjectResolverError = { NoSegments: "cache.subject.no.segments" };

export class CacheSubjectResolver {
  private readonly SEPARATOR = "|";

  constructor(private readonly segments: CacheSubjectSegmentPort[]) {
    if (this.segments.length === 0) throw new Error(CacheSubjectResolverError.NoSegments);
  }

  resolve(c: Context): { hex: CacheSubjectHexType; raw: CacheSubjectSegmentType[] } {
    const segments = this.segments.map((segment) =>
      segment.create(c).replaceAll(this.SEPARATOR, encodeURIComponent(this.SEPARATOR)),
    );
    const subject = segments.join(this.SEPARATOR);

    const hex = createHash("sha256").update(subject).digest("hex");

    return { hex: CacheSubjectHex.parse(hex), raw: segments };
  }
}
