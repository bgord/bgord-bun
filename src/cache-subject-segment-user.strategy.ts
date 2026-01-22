import {
  CacheSubjectSegmentRequestEmpty,
  type CacheSubjectSegmentRequestStrategy,
  type CacheSubjectSegmentType,
} from "./cache-subject-segment-request.strategy";
import type { RequestContext } from "./request-context.port";

export class CacheSubjectSegmentUserStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: RequestContext): CacheSubjectSegmentType {
    return context.identity.userId() ?? CacheSubjectSegmentRequestEmpty;
  }
}
