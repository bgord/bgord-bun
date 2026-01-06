import type { Context } from "hono";

export const CacheSubjectSegmentRequestEmpty: CacheSubjectSegmentType = "__absent__";

export type CacheSubjectSegmentType = string;

export interface CacheSubjectSegmentRequestStrategy {
  create(context: Context): CacheSubjectSegmentType;
}
