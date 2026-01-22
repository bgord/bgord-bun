import {
  CacheSubjectSegmentRequestEmpty,
  type CacheSubjectSegmentRequestStrategy,
  type CacheSubjectSegmentType,
} from "./cache-subject-segment-request.strategy";
import type { HasIdentityUserId } from "./request-context.port";

export class CacheSubjectSegmentUserStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: HasIdentityUserId): CacheSubjectSegmentType {
    return context.identity.userId() ?? CacheSubjectSegmentRequestEmpty;
  }
}
