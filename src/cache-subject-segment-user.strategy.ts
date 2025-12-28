import type { Context } from "hono";
import type { CacheSubjectSegmentStrategy } from "./cache-subject-segment.strategy";

export class CacheSubjectSegmentUserStrategy implements CacheSubjectSegmentStrategy {
  create(context?: Context) {
    return context?.get("user")?.id ?? "anon";
  }
}
