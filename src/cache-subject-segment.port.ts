import type { Context } from "hono";

export type CacheSubjectSegmentType = string;

export interface CacheSubjectSegmentPort {
  create(context?: Context): CacheSubjectSegmentType;
}
