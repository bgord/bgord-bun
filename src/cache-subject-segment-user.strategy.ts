import type { Context } from "hono";
import type { CacheSubjectSegmentRequestStrategy } from "./cache-subject-segment-request.strategy";

export class CacheSubjectSegmentUserStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: Context) {
    return context.get("user")?.id ?? "anon";
  }
}
