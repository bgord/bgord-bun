import type { Context } from "hono";
import type { CacheSubjectSegmentStrategy } from "./cache-subject-segment.strategy";

export class CacheSubjectSegmentPathStrategy implements CacheSubjectSegmentStrategy {
  create(context?: Context) {
    return context?.req.path ?? "";
  }
}
