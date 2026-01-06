import type { CacheSubjectSegmentApplicationStrategy } from "./cache-subject-segment-application.strategy";
import type { CacheSubjectSegmentRequestStrategy } from "./cache-subject-segment-request.strategy";

export class CacheSubjectSegmentFixedStrategy
  implements CacheSubjectSegmentRequestStrategy, CacheSubjectSegmentApplicationStrategy
{
  constructor(private readonly value: string) {}

  create() {
    return this.value;
  }
}
