import { createHash } from "node:crypto";
import type { Context } from "hono";
import type { CacheSubjectSegmentPort, CacheSubjectSegmentType } from "./cache-subject-segment.port";

export const CacheSubjectError = { NoSegments: "cache.subject.no.segments" };

export class CacheSubject {
  private readonly SEPARATOR = "|";

  constructor(private readonly segments: CacheSubjectSegmentPort[]) {
    if (this.segments.length === 0) throw new Error(CacheSubjectError.NoSegments);
  }

  resolve(c: Context): { hex: string; raw: CacheSubjectSegmentType[] } {
    const segments = this.segments.map((segment) =>
      segment.create(c).replaceAll(this.SEPARATOR, encodeURIComponent(this.SEPARATOR)),
    );
    const subject = segments.join(this.SEPARATOR);

    return { hex: createHash("sha256").update(subject).digest("hex"), raw: segments };
  }
}
