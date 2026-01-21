import type { CacheSubjectSegmentType } from "./cache-subject-segment-request.strategy";
import {
  CacheSubjectSegmentRequestEmpty,
  type CacheSubjectSegmentRequestStrategy,
} from "./cache-subject-segment-request.strategy";
import type { RequestContext } from "./request-context.port";

export class CacheSubjectSegmentCookieStrategy implements CacheSubjectSegmentRequestStrategy {
  constructor(private readonly name: string) {}

  create(context: RequestContext): CacheSubjectSegmentType {
    return context.request.cookie(this.name) ?? CacheSubjectSegmentRequestEmpty;
  }
}
