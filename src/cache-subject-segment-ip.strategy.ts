import {
  CacheSubjectSegmentRequestEmpty,
  type CacheSubjectSegmentRequestStrategy,
  type CacheSubjectSegmentType,
} from "./cache-subject-segment-request.strategy";
import type { RequestContext } from "./request-context.port";

export class CacheSubjectSegmentIpStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: RequestContext): CacheSubjectSegmentType {
    return context.identity.ip() ?? CacheSubjectSegmentRequestEmpty;
  }
}
