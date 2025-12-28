import type { Context } from "hono";

export type CacheSubjectSegmentType = string;

export interface CacheSubjectSegmentStrategy {
  create(context?: Context): CacheSubjectSegmentType;
}
