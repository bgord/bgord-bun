import type { Context } from "hono";
import type { CacheSubjectSegmentRequestStrategy } from "./cache-subject-segment-request.strategy";

export class CacheSubjectSegmentPathStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: Context) {
    return context.req.path;
  }
}
