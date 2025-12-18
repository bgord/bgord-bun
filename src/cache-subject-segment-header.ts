import type { Context } from "hono";
import type { CacheSubjectSegmentPort } from "./cache-subject-segment.port";

export class CacheSubjectSegmentHeader implements CacheSubjectSegmentPort {
  constructor(private readonly name: string) {}

  create(c: Context) {
    return c.req.header(this.name) ?? "";
  }
}
