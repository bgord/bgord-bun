import type { Context } from "hono";
import type {
  CacheSubjectSegmentRequestStrategy,
  CacheSubjectSegmentType,
} from "./cache-subject-segment-request.strategy";

export class CacheSubjectSegmentPathStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: Context): CacheSubjectSegmentType {
    return context.req.path;
  }
}
