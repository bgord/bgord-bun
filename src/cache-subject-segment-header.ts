import type { Context } from "hono";
import type { CacheSubjectSegmentPort } from "./cache-subject-segment.port";

export class CacheSubjectSegmentHeader implements CacheSubjectSegmentPort {
  constructor(private readonly name: string) {}

  create(context?: Context) {
    return context?.req.header(this.name) ?? "";
  }
}
