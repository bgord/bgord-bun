import type {
  CacheSubjectSegmentRequestStrategy,
  CacheSubjectSegmentType,
} from "./cache-subject-segment-request.strategy";
import type { RequestContext } from "./request-context.port";

export class CacheSubjectSegmentPathStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: RequestContext): CacheSubjectSegmentType {
    return context.request.path;
  }
}
