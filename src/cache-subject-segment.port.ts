import type { Context } from "hono";

export interface CacheSubjectSegmentPort {
  create(c: Context): string;
}
