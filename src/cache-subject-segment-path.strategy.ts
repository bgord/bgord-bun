import type {
  CacheSubjectSegmentRequestStrategy,
  CacheSubjectSegmentType,
} from "./cache-subject-segment-request.strategy";
import type { HasRequestPath } from "./request-context.port";

export class CacheSubjectSegmentPathStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: HasRequestPath): CacheSubjectSegmentType {
    return context.request.path;
  }
}
