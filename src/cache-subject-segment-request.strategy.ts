import type { RequestContext } from "./request-context.port";

export const CacheSubjectSegmentRequestEmpty: CacheSubjectSegmentType = "__absent__";

export type CacheSubjectSegmentType = string;

export interface CacheSubjectSegmentRequestStrategy {
  create(context: RequestContext): CacheSubjectSegmentType;
}
