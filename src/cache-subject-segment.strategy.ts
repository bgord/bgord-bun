import type { Context } from "hono";

export const CacheSubjectSegmentEmpty: CacheSubjectSegmentType = "";

export type CacheSubjectSegmentType = string;

export interface CacheSubjectSegmentStrategy {
  create(context?: Context): CacheSubjectSegmentType;
}
