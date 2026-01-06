import type { CacheSubjectSegmentType } from "./cache-subject-segment-request.strategy";

export const CacheSubjectSegmentApplicationEmpty: CacheSubjectSegmentType = "__absent__";

export interface CacheSubjectSegmentApplicationStrategy {
  create(): CacheSubjectSegmentType;
}
