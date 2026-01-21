import type { Context } from "hono";
import type {
  CacheSubjectSegmentRequestStrategy,
  CacheSubjectSegmentType,
} from "./cache-subject-segment-request.strategy";

export class CacheSubjectSegmentUserStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: Context): CacheSubjectSegmentType {
    return context.get("user")?.id ?? "anon";
  }
}
