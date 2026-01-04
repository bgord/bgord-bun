import type { Context } from "hono";
import { CacheSubjectSegmentEmpty, type CacheSubjectSegmentStrategy } from "./cache-subject-segment.strategy";

export class CacheSubjectSegmentPathStrategy implements CacheSubjectSegmentStrategy {
  create(context?: Context) {
    return context?.req.path ?? CacheSubjectSegmentEmpty;
  }
}
