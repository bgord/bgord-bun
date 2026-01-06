import type { Context } from "hono";

export const CacheSubjectSegmentEmpty: CacheSubjectSegmentType = "__absent__";

export type CacheSubjectSegmentType = string;

export interface CacheSubjectSegmentStrategy {
  create(context?: Context): CacheSubjectSegmentType;
}
