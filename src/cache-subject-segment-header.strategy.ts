import type { CacheSubjectSegmentType } from "./cache-subject-segment-request.strategy";
import {
  CacheSubjectSegmentRequestEmpty,
  type CacheSubjectSegmentRequestStrategy,
} from "./cache-subject-segment-request.strategy";
import type { HasRequestHeader } from "./request-context.port";

export class CacheSubjectSegmentHeaderStrategy implements CacheSubjectSegmentRequestStrategy {
  constructor(private readonly name: string) {}

  create(context: HasRequestHeader): CacheSubjectSegmentType {
    return context.request.header(this.name) ?? CacheSubjectSegmentRequestEmpty;
  }
}
