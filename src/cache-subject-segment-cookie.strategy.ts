import type { CacheSubjectSegmentType } from "./cache-subject-segment-request.strategy";
import {
  CacheSubjectSegmentRequestEmpty,
  type CacheSubjectSegmentRequestStrategy,
} from "./cache-subject-segment-request.strategy";
import type { HasRequestCookie } from "./request-context.port";

export class CacheSubjectSegmentCookieStrategy implements CacheSubjectSegmentRequestStrategy {
  constructor(private readonly name: string) {}

  create(context: HasRequestCookie): CacheSubjectSegmentType {
    return context.request.cookie(this.name) ?? CacheSubjectSegmentRequestEmpty;
  }
}
