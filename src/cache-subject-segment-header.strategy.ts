import type { Context } from "hono";
import { CacheSubjectSegmentEmpty, type CacheSubjectSegmentStrategy } from "./cache-subject-segment.strategy";

export class CacheSubjectSegmentHeaderStrategy implements CacheSubjectSegmentStrategy {
  constructor(private readonly name: string) {}

  create(context?: Context) {
    return context?.req.header(this.name) ?? CacheSubjectSegmentEmpty;
  }
}
