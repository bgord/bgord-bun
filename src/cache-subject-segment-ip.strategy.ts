import {
  CacheSubjectSegmentRequestEmpty,
  type CacheSubjectSegmentRequestStrategy,
  type CacheSubjectSegmentType,
} from "./cache-subject-segment-request.strategy";
import type { HasIdentityIp } from "./request-context.port";

export class CacheSubjectSegmentIpStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: HasIdentityIp): CacheSubjectSegmentType {
    return context.identity.ip() ?? CacheSubjectSegmentRequestEmpty;
  }
}
